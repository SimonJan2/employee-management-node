const { AuditLog } = require('../models');
const logger = require('./logger');

const auditLogger = {
    async log(userId, action, details) {
        try {
            await AuditLog.create({
                userId,
                action,
                details,
                timestamp: new Date(),
                ipAddress: req.ip
            });
        } catch (error) {
            logger.error('Failed to create audit log:', error);
        }
    },

    async getAuditTrail(filters) {
        try {
            return await AuditLog.findAll({
                where: filters,
                order: [['timestamp', 'DESC']]
            });
        } catch (error) {
            logger.error('Failed to retrieve audit trail:', error);
            throw error;
        }
    }
};

module.exports = {
    securityMiddleware,
    MonitoringService,
    alertConfig,
    auditLogger
};