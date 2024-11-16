const cloudwatch = require('aws-sdk/clients/cloudwatch');
const logger = require('./logger');

class MonitoringService {
    constructor() {
        this.cloudwatch = new cloudwatch({
            region: process.env.AWS_REGION
        });
        this.namespace = 'EmployeeManagement';
    }

    async publishMetric(metricName, value, unit = 'Count', dimensions = []) {
        try {
            await this.cloudwatch.putMetricData({
                Namespace: this.namespace,
                MetricData: [{
                    MetricName: metricName,
                    Value: value,
                    Unit: unit,
                    Dimensions: dimensions,
                    Timestamp: new Date()
                }]
            }).promise();
        } catch (error) {
            logger.error('Failed to publish metric:', error);
        }
    }

    async trackUserActivity(userId, action) {
        await this.publishMetric('UserActivity', 1, 'Count', [
            { Name: 'UserId', Value: userId },
            { Name: 'Action', Value: action }
        ]);
    }

    async trackTicketMetrics(ticketId, status) {
        await this.publishMetric('TicketStatus', 1, 'Count', [
            { Name: 'TicketId', Value: ticketId },
            { Name: 'Status', Value: status }
        ]);
    }

    async trackAPILatency(endpoint, latency) {
        await this.publishMetric('APILatency', latency, 'Milliseconds', [
            { Name: 'Endpoint', Value: endpoint }
        ]);
    }
}
