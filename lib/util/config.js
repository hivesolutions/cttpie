const util = require("hive-js-util");

const HOST = process.env.HOST ? process.env.HOST : "127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const KEY = process.env.CTTPIE_KEY ? process.env.CTTPIE_KEY : null;

const startLogging = () => {
    const logger = util.Logging.getLogger(undefined, {
        level: util.Logging.constants.DEBUG
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
    HOST: HOST,
    PORT: PORT,
    KEY: KEY,
    startLogging: startLogging
};
