const { MetricsCollector } = require('../utils/metrics');
const metricsCollector = new MetricsCollector();

const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000; // Convert to seconds
        metricsCollector.recordHttpRequest(
            req.method,
            req.route?.path || req.path,
            res.statusCode,
            duration
        );
    });

    next();
};

// Health check endpoint
const healthCheck = async (req, res) => {
    try {
        const metrics = await metricsCollector.getSystemMetrics();
        res.json({
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: Date.now(),
            metrics
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
};

module.exports = {
    metricsMiddleware,
    healthCheck,
    metricsCollector
};