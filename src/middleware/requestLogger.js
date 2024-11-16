const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration,
            userIP: req.ip,
            userId: req.user?.id
        });
    });

    next();
};

module.exports = requestLogger;