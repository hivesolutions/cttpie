const util = require("hive-js-util");
const yonius = require("yonius");

const conf = {};

const start = async () => {
    await startBase();
    await Promise.all([startConfig(), startLogging()]);
};

const stop = async () => {};

const startBase = async () => {
    await yonius.load();
};

const startConfig = async () => {
    conf.HOST = yonius.conf("HOST", "127.0.0.1");
    conf.PORT = yonius.conf("PORT", 3000, "int");
    conf.KEY = yonius.conf("CTTPIE_KEY", null);
    conf.CSRF_TOKEN = yonius.conf("CSRF_TOKEN", "ghgqWGcL1HLRGdFP7GkP5X4nSwQ=");
    conf.COOKIE = yonius.conf(
        "COOKIE",
        "nr1Users=lid%3d%2f%2fPzodEvPBAEABuWowN88Q%3d%3dhGp1wd4i3QCFyVbrPVWJVg%3d%3d%3btuu%3d63780025128%3bexp%3d63780026628%3brhs%3dXBC1ss1nOgYW1SmqUjSxLucVOAg%3d%3bhmc%3drfF6QwkY%2fENMlEQPFhdf8eRbe%2f8%3d; nr2Users=crf%3dghgqWGcL1HLRGdFP7GkP5X4nSwQ%3d%3buid%3d944774%3bunm%3djoamag%40gmail.com;"
    );
};

const startLogging = () => {
    const level = yonius.conf("LEVEL", "DEBUG").toUpperCase();

    const logger = util.Logging.getLogger(undefined, {
        level: util.Logging.constants[level]
    });

    if (util.Logging.ConsolaHandler.isReady()) {
        logger.addHandler(new util.Logging.ConsolaHandler());
        logger.setFormatter(new util.Logging.SimpleFormatter("{asctime} {message}"));
    } else {
        logger.addHandler(new util.Logging.StreamHandler());
        logger.setFormatter(new util.Logging.SimpleFormatter());
    }
};

module.exports = {
    conf: conf,
    start: start,
    stop: stop
};
