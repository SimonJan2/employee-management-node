document.addEventListener('DOMContentLoaded', () => {
    // Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Set up headers for API calls
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Load dashboard data
    const loadDashboardData = async () => {
        try {
            const [usersResponse, ticketsResponse, departmentsResponse] = await Promise.all([
                fetch('/api/users', { headers }),
                fetch('/api/tickets', { headers }),
                fetch('/api/departments', { headers })
            ]);

            const [users, tickets, departments] = await Promise.all([
                usersResponse.json(),
                ticketsResponse.json(),
                departmentsResponse.json()
            ]);

            // Update counters
            document.getElementById('employee-count').textContent = users.length || 0;
            document.getElementById('ticket-count').textContent = 
                tickets.filter(t => t.status !== 'closed').length || 0;
            document.getElementById('department-count').textContent = departments.length || 0;

            // Update recent activity
            updateRecentActivity(tickets);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showToast('Error loading dashboard data', 'error');
        }
    };

    // Update recent activity section
    const updateRecentActivity = (tickets) => {
        const activityContainer = document.getElementById('recent-activity');
        const recentTickets = tickets
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);

        if (recentTickets.length === 0) {
            activityContainer.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    No recent activity
                </div>
            `;
            return;
        }

        const activityHtml = recentTickets.map(ticket => `
            <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                    <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500">
                        <span class="text-white font-medium">${ticket.title.charAt(0)}</span>
                    </span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                        ${ticket.title}
                    </p>
                    <p class="text-sm text-gray-500">
                        Status: <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}">
                            ${ticket.status}
                        </span>
                    </p>
                </div>
                <div class="text-sm text-gray-500">
                    ${new Date(ticket.updatedAt).toLocaleDateString()}
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHtml;
    };

    // Helper function for ticket status colors
    const getStatusColor = (status) => {
        const colors = {
            'open': 'bg-yellow-100 text-yellow-800',
            'in_progress': 'bg-blue-100 text-blue-800',
            'resolved': 'bg-green-100 text-green-800',
            'closed': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.open;
    };

    // Load initial data
    loadDashboardData();

    // Refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
});