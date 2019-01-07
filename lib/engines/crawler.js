const request = require("request");
const engine = require("./engine");
const parser = require("node-html-parser");

class Crawler extends engine.Engine {
    async init() {}

    async destroy() {}

    async track(req, res, next) {
        const tracking = req.query.tracking;
        const url = `http://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${tracking}`;
        const result = await new Promise(function(resolve, reject) {
            request(url, { }, function(err, res, body) {
                if (err) { reject(err); }
                const value = parser.parse(body);
                resolve(value);
            });
        });
        console.info(result);
        return "Hello World";
    }
}

module.exports = {
    Crawler: Crawler
};
