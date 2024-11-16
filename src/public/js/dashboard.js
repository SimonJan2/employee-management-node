document.addEventListener('DOMContentLoaded', () => {
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
            const [usersResponse, ticketsResponse] = await Promise.all([
                fetch('/api/users', { headers }),
                fetch('/api/tickets', { headers })
            ]);

            const users = await usersResponse.json();
            const tickets = await ticketsResponse.json();

            // Update statistics
            document.getElementById('employee-count').textContent = users.length;
            document.getElementById('ticket-count').textContent = tickets.filter(t => t.status !== 'closed').length;
            document.getElementById('department-count').textContent = 
                [...new Set(users.map(u => u.departmentId))].filter(Boolean).length;

            // Update recent activity
            updateRecentActivity(tickets, users);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    // Update recent activity section
    const updateRecentActivity = (tickets, users) => {
        const activityContainer = document.getElementById('recent-activity');
        const recentTickets = tickets
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);

        const activityHtml = recentTickets.map(ticket => `
            <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                    <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500">
                        <span class="text-white font-medium">${ticket.title.charAt(0)}</span>
                    </span>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${ticket.title}</p>
                    <p class="text-sm text-gray-500">
                        Status: <span class="ticket-status-${ticket.status}">${ticket.status}</span>
                    </p>
                </div>
                <div class="text-sm text-gray-500">
                    ${new Date(ticket.updatedAt).toLocaleDateString()}
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHtml;
    };

    // Load initial data
    loadDashboardData();

    // Refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
});