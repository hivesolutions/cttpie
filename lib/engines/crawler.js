const fetch = require("node-fetch");
const parser = require("node-html-parser");
const entities = require("html-entities");
const yonius = require("yonius");
const engine = require("./engine");
const config = require("../util/config");

const COLUMN_SEQUENCE = ["time", "status", "reason", "location", "person"];
const MONTHS = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro"
];

class Crawler extends engine.Engine {
    async init() {}

    async destroy() {}

    async track(req, res, next) {
        const tracking = req.query.tracking;
        if (!tracking) throw new yonius.OperationalError("No tracking number provided", 400);

        const handler = this[`_handle${this._handler}`].bind(this);
        const { identifier, statusDate, statusHour, status, states } = await handler(tracking);

        res.setHeader("Content-Type", "application/json");
        res.send(
            JSON.stringify({
                tracking: tracking,
                identifier: identifier,
                status: status,
                status_date: statusDate,
                status_hour: statusHour,
                states: states
            })
        );
    }

    async _handleNeo(tracking) {
        const url =
            "https://appserver.ctt.pt/CustomerArea/screenservices/CustomerArea/CustomerArea/PublicArea_Detail/DataActionGetObjectEventsByInputObjectCode";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "X-CSRFToken": config.conf.CSRF_TOKEN,
                Cookie: config.conf.COOKIE,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                versionInfo: {
                    apiVersion: await this._getApiVersion()
                },
                viewName: "CustomerArea.PublicArea_Detail",
                screenData: {
                    variables: {
                        ObjectsLength: -1,
                        ObjectCodeInput: tracking,
                        _objectCodeInputInDataFetchStatus: 1,
                        SearchInput: tracking,
                        _searchInputInDataFetchStatus: 1
                    }
                }
            })
        });
        const data = await response.json();

        const versionInfo = data.versionInfo;
        if (versionInfo.hasApiVersionChanged) {
            throw new yonius.OperationalError(
                "API version information changed, requires re-config",
                500
            );
        }

        const info = data.data.ObjectEventsFromQuery;
        if (info === undefined) {
            throw new yonius.OperationalError("Error obtained remote data, invalid session", 500);
        }

        const events = info.Events || {};
        const eventsList = events.List || [];

        if (!info.Found) {
            throw new yonius.OperationalError("Tracking number not found", 404);
        }

        const states = [];
        let status = null;

        eventsList.forEach(event => {
            const state = {
                status: event.State || null,
                details: event.Event || null,
                date_time: event.DateTime || null
            };
            states.push(state);
        });

        // uses the status of the first state as the statues of the order
        // as a whole (to be processed by external agents)
        if (!status) status = states.length > 0 ? states[0].status : null;

        return {
            identifier: info.ObjectName,
            status: status,
            states: states
        };
    }

    async _handleLegacy(tracking) {
        // gathers the information from the target CTT page using
        // the node's HTML parser engine
        const url = `http://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${tracking}`;
        const response = await fetch(url);
        const body = await response.text();
        const root = parser.parse(body);

        // obtains the reference to the multiple elements from which
        // information is going to be obtained
        const headerTable = root.querySelector(".full-width");
        const header = headerTable.querySelectorAll("tr")[1];
        const details = root.querySelector("#details_0");
        const table = details.querySelector("table");

        // in case no header or table is found in the target page an error
        // must be raised (erroneous situation)
        if (!header) throw new yonius.OperationalError("No header found in page");
        if (!table) throw new yonius.OperationalError("No table found in page");

        // unpacks the multiple header elements for the tracking element
        // so that we can define the summary of the tracking status
        const identifier = header.childNodes[1].structuredText;
        const statusDate = header.childNodes[5].structuredText;
        const statusHour = header.childNodes[7].structuredText;
        let status = header.childNodes[9].structuredText;

        // builds the sequence that is going to hold the multiple states
        const states = [];

        let date = null;
        let dateLabel = null;

        // iterates over the complete st of rows in the table trying
        // to find the multiple states for the order
        for (const row of table.childNodes) {
            // verifies if the current node is a valid and
            // concrete row and in case its not continue the loop
            if (row.nodeType !== parser.NodeType.ELEMENT_NODE) continue;
            if (row.tagName.toLowerCase() !== "tr") continue;

            let index = 0;
            const state = {};

            // iterates over the complete set of columns in the row to try
            // to find the correct label ones
            for (const column of row.childNodes) {
                if (column.nodeType !== parser.NodeType.ELEMENT_NODE) {
                    continue;
                }

                // in case the current child is a row we assume that
                // this is the date field for the current state
                if (column.tagName.toLowerCase() === "tr") {
                    dateLabel = entities.AllHtmlEntities.decode(column.structuredText);
                    date = this._parseDate(dateLabel);
                    continue;
                }

                // in case the current element is now a column skips
                // the current iteration (nothing useful here)
                if (column.tagName.toLowerCase() !== "td") {
                    continue;
                }

                const columnName = COLUMN_SEQUENCE[index];
                state[columnName] = entities.AllHtmlEntities.decode(column.structuredText);
                index++;
            }
            const [hours, minutes] = this._parseTime(state.time);
            const stateDate = new Date(date.getTime() + (hours * 3600 + minutes * 60) * 1000);
            const stateTimestamp = stateDate.getTime();
            state.date = stateDate;
            state.date_label = dateLabel;
            state.timestamp = parseInt(stateTimestamp / 1000);
            states.push(state);
        }

        // uses the status of the first state as the statues of the order
        // as a whole (to be processed by external agents)
        if (!status) status = states.length > 0 ? states[0].status : null;

        return {
            identifier: identifier,
            statusDate: statusDate,
            statusHour: statusHour,
            status: status,
            states: states
        };
    }

    async _getApiVersion(force = true) {
        if (config.API_VERSION) return config.API_VERSION;
        if (!force && this._apiVersion) return this._apiVersion;
        const configUrl =
            "https://appserver.ctt.pt/CustomerArea/scripts/CustomerArea.CustomerArea.PublicArea_Detail.mvc.js";
        const configResponse = await fetch(configUrl);
        const configData = await configResponse.text();
        const token = '/DataActionGetObjectEventsByInputObjectCode", ';
        const subConfig = configData.slice(configData.indexOf(token) + token.length);
        this._apiVersion = subConfig.slice(0, subConfig.indexOf(",")).trim();
        this._apiVersion = this._apiVersion.slice(1, this._apiVersion.length - 1);
        if (!this._apiVersion) {
            throw new yonius.OperationalError("Not possible to obtain API version", 500);
        }
        if (this._apiVersion.length !== 22) {
            throw new yonius.OperationalError(
                `Invalid API version token length expected 22 got ${this._apiVersion.length}`,
                500
            );
        }
        return this._apiVersion;
    }

    _parseDate(value) {
        let day, month, year;
        [day, month, year] = value.split(",")[1].trim().split(" ");
        day = parseInt(day);
        month = MONTHS.indexOf(month.toLowerCase());
        year = parseInt(year);
        const date = new Date(year, month, day);
        return date;
    }

    _parseTime(value) {
        let hours, minutes;
        [hours, minutes] = value.split(":");
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        return [hours, minutes];
    }

    get _handler() {
        return config.conf.HANDLER.charAt(0).toUpperCase() + config.conf.HANDLER.slice(1);
    }
}

module.exports = {
    Crawler: Crawler
};
