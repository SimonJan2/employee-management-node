document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 0;
    let tickets = [];
    let users = [];
    let currentTicketId = null;

    // Initialize
    const initialize = async () => {
        try {
            await Promise.all([
                loadUsers(),
                loadTickets()
            ]);
            setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            showToast('Failed to initialize page', 'error');
        }
    };

    // Load tickets
    const loadTickets = async () => {
        try {
            showLoading(true);
            const response = await fetch('/api/tickets', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load tickets');
            tickets = await response.json();
            renderTickets();
        } catch (error) {
            console.error('Error loading tickets:', error);
            showToast(error.message, 'error');
        } finally {
            showLoading(false);
        }
    };

    // Load users for assignee dropdown
    const loadUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load users');
            users = await response.json();
            populateAssigneeDropdowns();
        } catch (error) {
            console.error('Error loading users:', error);
            showToast('Failed to load users', 'error');
        }
    };

    // Render tickets
    const renderTickets = () => {
        const container = document.getElementById('tickets-container');
        
        if (tickets.length === 0) {
            container.innerHTML = `
                <div class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                    No tickets found
                </div>
            `;
            return;
        }

        container.innerHTML = tickets.map(ticket => `
            <div class="bg-white shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                <div class="p-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-medium text-gray-900">
                            <a href="#" onclick="viewTicketDetails('${ticket.id}'); return false;" class="hover:text-indigo-600">
                                ${ticket.title}
                            </a>
                        </h3>
                        <span class="ticket-status-${ticket.status} px-2 py-1 text-xs font-medium rounded-full">
                            ${ticket.status}
                        </span>
                    </div>
                    <div class="mt-2">
                        <p class="text-sm text-gray-600 line-clamp-2">
                            ${ticket.description}
                        </p>
                    </div>
                    <div class="mt-4 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <span class="priority-${ticket.priority} px-2 py-1 text-xs font-medium rounded-full">
                                ${ticket.priority}
                            </span>
                            <span class="text-sm text-gray-500">
                                ${ticket.assignee ? `Assigned to: ${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned'}
                            </span>
                        </div>
                        <div class="text-sm text-gray-500">
                            ${new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end space-x-2">
                        <button onclick="editTicket('${ticket.id}')" 
                            class="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button onclick="deleteTicket('${ticket.id}')"
                            class="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // New ticket button
        document.getElementById('new-ticket-btn').addEventListener('click', () => {
            openModal();
        });

        // Form submissions
        document.getElementById('ticket-form').addEventListener('submit', handleTicketSubmit);
        document.getElementById('comment-form').addEventListener('submit', handleCommentSubmit);

        // Modal close buttons
        document.querySelectorAll('.cancel-button, .close-detail-modal').forEach(button => {
            button.addEventListener('click', () => {
                closeModal();
                closeDetailModal();
            });
        });

        // Filters
        const applyFilters = () => {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const status = document.getElementById('status-filter').value;
            const priority = document.getElementById('priority-filter').value;
            const assigneeId = document.getElementById('assignee-filter').value;

            const filteredTickets = tickets.filter(ticket => {
                const matchesSearch = 
                    ticket.title.toLowerCase().includes(searchTerm) ||
                    ticket.description.toLowerCase().includes(searchTerm);
                const matchesStatus = !status || ticket.status === status;
                const matchesPriority = !priority || ticket.priority === priority;
                const matchesAssignee = !assigneeId || ticket.assigneeId === assigneeId;

                return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
            });

            renderFilteredTickets(filteredTickets);
        };

        ['search-input', 'status-filter', 'priority-filter', 'assignee-filter'].forEach(id => {
            document.getElementById(id).addEventListener('change', applyFilters);
            document.getElementById(id).addEventListener('input', applyFilters);
        });

        // Page size
        document.getElementById('page-size').addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value);
            currentPage = 1;
            renderTickets();
        });
    };

    // Modal handling
    const openModal = (ticketId = null) => {
        const modal = document.getElementById('ticket-modal');
        const form = document.getElementById('ticket-form');
        const title = document.getElementById('modal-title');

        title.textContent = ticketId ? 'Edit Ticket' : 'New Ticket';
        
        if (ticketId) {
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket) {
                populateForm(ticket);
            }
        } else {
            form.reset();
        }

        form.dataset.ticketId = ticketId;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        document.getElementById('ticket-modal').classList.add('hidden');
        document.getElementById('ticket-form').reset();
    };

    const closeDetailModal = () => {
        document.getElementById('ticket-details-modal').classList.add('hidden');
    };

    // Populate assignee dropdowns
    const populateAssigneeDropdowns = () => {
        const options = users.map(user => 
            `<option value="${user.id}">${user.firstName} ${user.lastName}</option>`
        ).join('');

        document.getElementById('assignee-filter').innerHTML = 
            '<option value="">All Assignees</option>' + options;
        document.querySelector('select[name="assigneeId"]').innerHTML = 
            '<option value="">Unassigned</option>' + options;
    };

    // Handle form submissions
    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const form = e.target;
            const ticketId = form.dataset.ticketId;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const url = ticketId ? `/api/tickets/${ticketId}` : '/api/tickets';
            const method = ticketId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save ticket');

            showToast(`Ticket ${ticketId ? 'updated' : 'created'} successfully`, 'success');
            closeModal();
            await loadTickets();
        } catch (error) {
            console.error('Error saving ticket:', error);
            showToast(error.message, 'error');
        }
    };

    // View ticket details
    window.viewTicketDetails = async (ticketId) => {
        try {
            showLoading(true);
            const response = await fetch(`/api/tickets/${ticketId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load ticket details');
            
            const ticket = await response.json();
            currentTicketId = ticketId;
            
            const modal = document.getElementById('ticket-details-modal');
            document.getElementById('detail-modal-title').textContent = ticket.title;
            document.getElementById('detail-description').textContent = ticket.description;
            document.getElementById('detail-status').innerHTML = `
                <span class="ticket-status-${ticket.status} px-2 py-1 text-xs font-medium rounded-full">
                    ${ticket.status}
                </span>
            `;
            document.getElementById('detail-priority').innerHTML = `
                <span class="priority-${ticket.priority} px-2 py-1 text-xs font-medium rounded-full">
                    ${ticket.priority}
                </span>
            `;
            document.getElementById('detail-assignee').textContent = 
                ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned';

            await loadComments(ticketId);
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading ticket details:', error);
            showToast(error.message, 'error');
        } finally {
            showLoading(false);
        }
    };

    // Handle comments
    const loadComments = async (ticketId) => {
        try {
            const response = await fetch(`/api/tickets/${ticketId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load comments');
            
            const comments = await response.json();
            renderComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
            showToast('Failed to load comments', 'error');
        }
    };

    const renderComments = (comments) => {
        const container = document.getElementById('comments-container');
        
        if (comments.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No comments yet</p>';
            return;
        }

        container.innerHTML = comments.map(comment => `
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <img src="${comment.user.profilePicture || '/images/default-avatar.png'}" 
                            alt="" class="h-8 w-8 rounded-full">
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900">
                                ${comment.user.firstName} ${comment.user.lastName}
                            </p>
                            <p class="text-xs text-gray-500">
                                ${new Date(comment.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-2 text-sm text-gray-700">
                    ${comment.content}
                </div>
            </div>
        `).join('');
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!currentTicketId) return;

        try {
            const form = e.target;
            const formData = new FormData(form);

            const response = await fetch(`/api/tickets/${currentTicketId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: formData.get('content') })
            });

            if (!response.ok) throw new Error('Failed to add comment');

            form.reset();
            await loadComments(currentTicketId);
            showToast('Comment added successfully', 'success');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast(error.message, 'error');
        }
    };

    // Initialize page
    initialize();
});