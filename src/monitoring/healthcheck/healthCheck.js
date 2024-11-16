const os = require('os');
const { pool } = require('../../db/config/database');

async function performHealthCheck() {
    const checks = {
        uptime: process.uptime(),
        responseTime: Date.now(),
        databaseConnection: false,
        memoryUsage: process.memoryUsage(),
        systemMemory: {
            total: os.totalmem(),
            free: os.freemem()
        },
        cpuLoad: os.loadavg()
    };

    try {
        await pool.query('SELECT 1');
        checks.databaseConnection = true;
    } catch (error) {
        checks.databaseConnection = false;
        checks.databaseError = error.message;
    }

    const healthy = checks.databaseConnection && 
                   (checks.systemMemory.free / checks.systemMemory.total) > 0.2;

    return {
        healthy,
        timestamp: new Date(),
        checks
    };
}

module.exports = performHealthCheck;