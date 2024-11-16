document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 0;
    let tickets = [];
    let users = [];
    let currentTicketId = null;
    let filters = {
        search: '',
        status: '',
        priority: '',
        assigneeId: ''
    };

    // Initialize
    const initialize = async () => {
        try {
            // Load users for assignee dropdown
            users = await utils.fetchWithAuth('/api/users');
            populateAssigneeDropdowns();

            // Load initial tickets
            await loadTickets();

            // Set up event listeners
            setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            showToast('Failed to initialize page', 'error');
        }
    };

    // Load tickets with filtering and pagination
    const loadTickets = async () => {
        try {
            showLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: pageSize,
                ...filters
            });

            const response = await utils.fetchWithAuth(`/api/tickets?${queryParams}`);
            tickets = response.data;
            totalPages = Math.ceil(response.total / pageSize);

            renderTickets();
            renderPagination();
        } catch (error) {
            console.error('Error loading tickets:', error);
            showToast('Failed to load tickets', 'error');
        } finally {
            showLoading(false);
        }
    };

    // Render individual ticket card
    const renderTicketCard = (ticket) => `
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
                    <p class="text-sm text-gray-600">
                        ${utils.truncateText(ticket.description, 150)}
                    </p>
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center text-sm text-gray-500">
                            <span class="priority-${ticket.priority} px-2 py-1 text-xs font-medium rounded-full">
                                ${ticket.priority}
                            </span>
                        </div>
                        <div class="text-sm text-gray-500">
                            ${ticket.assignee ? `Assigned to: ${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned'}
                        </div>
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
    `;

    // Render tickets
    const renderTickets = () => {
        const container = document.getElementById('tickets-container');
        if (tickets.length === 0) {
            container.innerHTML = `
                <div class="bg-white shadow rounded-lg p-6 text-center">
                    <p class="text-gray-500">No tickets found</p>
                </div>
            `;
            return;
        }
        container.innerHTML = tickets.map(renderTicketCard).join('');
    };

    // Populate assignee dropdowns
    const populateAssigneeDropdowns = () => {
        const options = users.map(user => 
            `<option value="${user.id}">${user.firstName} ${user.lastName}</option>`
        ).join('');

        document.querySelector('select[name="assigneeId"]').innerHTML = 
            '<option value="">Unassigned</option>' + options;
        document.getElementById('assignee-filter').innerHTML = 
            '<option value="">All Assignees</option>' + options;
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // New ticket button
        document.getElementById('new-ticket-btn').addEventListener('click', () => {
            openModal();
        });

        // Cancel button
        document.getElementById('cancel-button').addEventListener('click', closeModal);
        document.querySelector('.close-detail-modal-btn').addEventListener('click', closeDetailModal);

        // Form submission
        document.getElementById('ticket-form').addEventListener('submit', handleTicketSubmit);
        document.getElementById('comment-form').addEventListener('submit', handleCommentSubmit);

        // Filters
        const applyFilters = utils.debounce(() => {
            filters = {
                search: document.getElementById('search-input').value,
                status: document.getElementById('status-filter').value,
                priority: document.getElementById('priority-filter').value,
                assigneeId: document.getElementById('assignee-filter').value
            };
            currentPage = 1;
            loadTickets();
        }, 300);

        document.getElementById('search-input').addEventListener('input', applyFilters);
        document.getElementById('status-filter').addEventListener('change', applyFilters);
        document.getElementById('priority-filter').addEventListener('change', applyFilters);
        document.getElementById('assignee-filter').addEventListener('change', applyFilters);

        // Page size
        document.getElementById('page-size').addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value);
            currentPage = 1;
            loadTickets();
        });
    };

    // Modal handling
    const openModal = (ticketId = null) => {
        const modalTitle = document.getElementById('modal-title');
        const modal = document.getElementById('ticket-modal');
        const form = document.getElementById('ticket-form');

        modalTitle.textContent = ticketId ? 'Edit Ticket' : 'New Ticket';
        
        if (ticketId) {
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket) {
                form.title.value = ticket.title;
                form.description.value = ticket.description;
                form.priority.value = ticket.priority;
                form.status.value = ticket.status;
                form.assigneeId.value = ticket.assigneeId || '';
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

    // Handle ticket form submission
    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const ticketId = form.dataset.ticketId;
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            const url = ticketId ? `/api/tickets/${ticketId}` : '/api/tickets';
            const method = ticketId ? 'PUT' : 'POST';

            await utils.fetchWithAuth(url, {
                method,
                body: JSON.stringify(data)
            });

            showToast(`Ticket ${ticketId ? 'updated' : 'created'} successfully`, 'success');
            closeModal();
            await loadTickets();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    // Ticket details handling
    window.viewTicketDetails = async (ticketId) => {
        try {
            showLoading(true);
            const ticket = await utils.fetchWithAuth(`/api/tickets/${ticketId}`);
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
            showToast(error.message, 'error');
        } finally {
            showLoading(false);
        }
    };

    const closeDetailModal = () => {
        document.getElementById('ticket-details-modal').classList.add('hidden');
        currentTicketId = null;
    };

    // Comments handling
    const loadComments = async (ticketId) => {
        try {
            const comments = await utils.fetchWithAuth(`/api/tickets/${ticketId}/comments`);
            const container = document.getElementById('comments-container');
            
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
            `).join('') || '<p class="text-gray-500 text-center">No comments yet</p>';
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!currentTicketId) return;

        try {
            const formData = new FormData(e.target);
            await utils.fetchWithAuth(`/api/tickets/${currentTicketId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content: formData.get('content') })
            });

            e.target.reset();
            await loadComments(currentTicketId);
            showToast('Comment added successfully', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    // Initialize the page
    initialize();

    // Export functions for global access
    window.editTicket = openModal;
    window.deleteTicket = async (ticketId) => {
        if (confirm('Are you sure you want to delete this ticket?')) {
            try {
                await utils.fetchWithAuth(`/api/tickets/${ticketId}`, {
                    method: 'DELETE'
                });
                
                showToast('Ticket deleted successfully', 'success');
                await loadTickets();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };
});