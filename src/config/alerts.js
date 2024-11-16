const AWS = require('aws-sdk');
const sns = new AWS.SNS({ region: process.env.AWS_REGION });

const alertConfig = {
    topics: {
        highPriorityAlerts: process.env.SNS_HIGH_PRIORITY_TOPIC,
        systemAlerts: process.env.SNS_SYSTEM_ALERTS_TOPIC
    },

    async sendAlert(topic, message, subject) {
        try {
            await sns.publish({
                TopicArn: this.topics[topic],
                Message: JSON.stringify(message),
                Subject: subject
            }).promise();
        } catch (error) {
            logger.error('Failed to send alert:', error);
        }
    },

    thresholds: {
        errorRate: 0.05, // 5% error rate threshold
        apiLatency: 1000, // 1 second latency threshold
        diskUsage: 0.85, // 85% disk usage threshold
        memoryUsage: 0.9 // 90% memory usage threshold
    }
};