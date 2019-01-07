const request = require("request");
const parser = require("node-html-parser");
const engine = require("./engine");

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
        const url = `http://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${tracking}`;
        const root = await new Promise(function(resolve, reject) {
            request(url, {}, function(err, res, body) {
                if (err) {
                    reject(err);
                }
                const root = parser.parse(body);
                resolve(root);
            });
        });
        const details = root.querySelector("#details_0");
        const table = details.querySelector("table");
        const states = [];
        let date = null;
        let dateS = null;
        for (const row of table.childNodes) {
            if (row.nodeType !== 1) {
                continue;
            }
            if (row.tagName !== "tr") {
                continue;
            }
            let index = 0;
            let state = {};
            for (const column of row.childNodes) {
                if (column.nodeType !== 1) {
                    continue;
                }
                if (column.tagName === "tr") {
                    dateS = column.structuredText;
                    date = this._parseDate(dateS);
                    continue;
                }
                if (column.tagName !== "td") {
                    continue;
                }
                let columnName = COLUMN_SEQUENCE[index];
                state[columnName] = column.structuredText;
                index++;
            }
            let hours, minutes;
            [hours, minutes] = this._parseTime(state.time);
            let stateDate = new Date(date.getTime() + (hours * 3600 + minutes * 60) * 1000);
            let stateTimestamp = stateDate.getTime();
            state.date = stateDate;
            state.dateS = dateS;
            state.timestamp = parseInt(stateTimestamp / 1000);
            states.push(state);
        }
        const status = states.length > 0 ? states[0].status : null;
        res.setHeader("Content-Type", "application/json");
        res.send(
            JSON.stringify({
                tracking: tracking,
                status: status,
                states: states
            })
        );
    }

    _parseDate(value) {
        let date, day, month, year;
        [day, month, year] = value
            .split(",")[1]
            .trim()
            .split(" ");
        day = parseInt(day);
        month = MONTHS.indexOf(month.toLowerCase());
        year = parseInt(year);
        date = new Date(year, month, day);
        return date;
    }

    _parseTime(value) {
        let hours, minutes;
        [hours, minutes] = value.split(":");
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        return [hours, minutes];
    }
}

module.exports = {
    Crawler: Crawler
};
