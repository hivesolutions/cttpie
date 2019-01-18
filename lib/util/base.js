const config = require("./config");
const crawler = require("../engines/crawler");

const ENGINES = {
    crawler: crawler.Crawler
};

const init = () => {
    initEngines();
};

const destroy = () => {
    destroyEngines();
};

/**
 * Initializes the complete set of registered "headless"
 * engines so that they become ready to be used.
 */
const initEngines = () => {
    Object.keys(ENGINES).forEach(function(key) {
        ENGINES[key].singleton().init();
    });
};

/**
 * Destroys the complete set of "headless" engines, so that
 * they become unavailable for usage.
 */
const destroyEngines = () => {
    Object.keys(ENGINES).forEach(function(key) {
        ENGINES[key].singleton().destroy();
    });
};

/**
 * Verifies that the key present in the request matches
 * the one defined in the current configuration, ensuring
 * that proper security measures are in place.
 *
 * @param {any} req The request to retrieve the key.
 */
const verifyKey = req => {
    if (!config.KEY) {
        return;
    }
    const _key = req.query.key || req.headers["X-Cttpie-Key"] || null;
    if (config.KEY === _key) {
        return;
    }
    throw new Error("Invalid key");
};

module.exports = {
    ENGINES: ENGINES,
    init: init,
    destroy: destroy,
    verifyKey: verifyKey
};
