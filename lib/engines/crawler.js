const request = require("request");
const parser = require("node-html-parser");
const engine = require("./engine");

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
        const sequence = ["time", "status", "reason", "location", "person"];
        const details = root.querySelector("#details_0");
        const table = details.querySelector("table");
        const states = [];
        let date = null;
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
                    date = column.structuredText;
                }
                if (column.tagName !== "td") {
                    continue;
                }
                let columnName = sequence[index];
                state[columnName] = column.structuredText;
                index++;
            }
            state.date = date;
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
}

module.exports = {
    Crawler: Crawler
};
