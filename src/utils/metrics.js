const prometheus = require('prom-client');
const logger = require('./logger');

// Initialize metrics
const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'ems_' });

// Custom metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
    name: 'ems_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new prometheus.Gauge({
    name: 'ems_active_users',
    help: 'Number of active users'
});

const ticketsCreated = new prometheus.Counter({
    name: 'ems_tickets_created_total',
    help: 'Total number of tickets created'
});

const ticketResolutionTime = new prometheus.Histogram({
    name: 'ems_ticket_resolution_time_seconds',
    help: 'Time taken to resolve tickets'
});

class MetricsCollector {
    recordHttpRequest(method, route, statusCode, duration) {
        httpRequestDurationMicroseconds
            .labels(method, route, statusCode)
            .observe(duration);
    }

    updateActiveUsers(count) {
        activeUsers.set(count);
    }

    incrementTicketsCreated() {
        ticketsCreated.inc();
    }

    recordTicketResolution(duration) {
        ticketResolutionTime.observe(duration);
    }

    async getSystemMetrics() {
        const metrics = await prometheus.register.getMetricsAsJSON();
        return {
            systemMetrics: metrics,
            customMetrics: {
                activeUsers: await activeUsers.get(),
                totalTickets: await ticketsCreated.get()
            }
        };
    }
}