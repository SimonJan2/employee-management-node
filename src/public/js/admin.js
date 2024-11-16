document.addEventListener('DOMContentLoaded', () => {
    // State management
    let departments = [];
    let systemSettings = {};
    let logs = [];

    // Initialize
    const initialize = async () => {
        try {
            await Promise.all([
                loadDashboardStats(),
                loadDepartments(),
                loadSystemSettings(),
                loadSystemLogs()
            ]);

            setupEventListeners();
            initializeTimezones();
        } catch (error) {
            console.error('Initialization error:', error);
            showToast('Failed to initialize admin panel', 'error');
        }
    };

    // Load dashboard statistics
    const loadDashboardStats = async () => {
        try {
            const stats = await fetchWithAuth('/api/admin/stats');
            
            document.getElementById('total-users-count').textContent = stats.totalUsers;
            document.getElementById('active-sessions-count').textContent = stats.activeSessions;
            document.getElementById('pending-approvals-count').textContent = stats.pendingApprovals;
            document.getElementById('system-alerts-count').textContent = stats.systemAlerts;
        } catch (error) {
            console.error('Error loading stats:', error);
            showToast('Failed to load dashboard stats', 'error');
        }
    };

    // Department management
    const loadDepartments = async () => {
        try {
            departments = await fetchWithAuth('/api/departments');
            renderDepartments();
        } catch (error) {
            console.error('Error loading departments:', error);
            showToast('Failed to load departments', 'error');
        }
    };

    const renderDepartments = () => {
        const container = document.getElementById('departments-list');
        
        if (departments.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    No departments found
                </div>
            `;
            return;
        }

        container.innerHTML = departments.map(dept => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                    <h3 class="text-sm font-medium text-gray-900">${dept.name}</h3>
                    <p class="text-sm text-gray-500">${dept.description || 'No description'}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editDepartment('${dept.id}')" 
                        class="text-indigo-600 hover:text-indigo-900">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button onclick="deleteDepartment('${dept.id}')" 
                        class="text-red-600 hover:text-red-900">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    };

    // System settings management
    const loadSystemSettings = async () => {
        try {
            systemSettings = await fetchWithAuth('/api/admin/settings');
            const form = document.getElementById('system-settings-form');
            
            form.companyName.value = systemSettings.companyName || '';
            form.systemEmail.value = systemSettings.systemEmail || '';
            form.timezone.value = systemSettings.timezone || 'UTC';
            form.maintenanceMode.checked = systemSettings.maintenanceMode || false;
        } catch (error) {
            console.error('Error loading system settings:', error);
            showToast('Failed to load system settings', 'error');
        }
    };

    const saveSystemSettings = async (formData) => {
        try {
            await fetchWithAuth('/api/admin/settings', {
                method: 'PUT',
                body: JSON.stringify(Object.fromEntries(formData))
            });
            showToast('Settings saved successfully', 'success');
        } catch (error) {
            showToast('Failed to save settings', 'error');
        }
    };

    // System logs management
    const loadSystemLogs = async () => {
        try {
            const filter = document.getElementById('log-type-filter').value;
            logs = await fetchWithAuth(`/api/admin/logs?type=${filter}`);
            renderLogs();
        } catch (error) {
            console.error('Error loading system logs:', error);
            showToast('Failed to load system logs', 'error');
        }
    };

    const renderLogs = () => {
        const container = document.getElementById('system-logs');
        
        if (logs.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    No logs found
                </div>
            `;
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="p-3 rounded-lg ${getLogTypeClass(log.type)}">
                <div class="flex justify-between items-start">
                    <div class="flex items-center">
                        <span class="text-sm font-medium">${log.message}</span>
                    </div>
                    <span class="text-xs text-gray-500">${new Date(log.timestamp).toLocaleString()}</span>
                </div>
                ${log.details ? `<pre class="mt-2 text-xs overflow-x-auto">${JSON.stringify(log.details, null, 2)}</pre>` : ''}
            </div>
        `).join('');
    };

    const getLogTypeClass = (type) => {
        const classes = {
            error: 'bg-red-50 text-red-700',
            warning: 'bg-yellow-50 text-yellow-700',
            info: 'bg-blue-50 text-blue-700'
        };
        return classes[type] || classes.info;
    };

    // Event listeners
    const setupEventListeners = () => {
        // Department management
        document.getElementById('add-department-btn').addEventListener('click', () => {
            openDepartmentModal();
        });

        document.getElementById('department-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const departmentId = e.target.dataset.departmentId;
            
            try {
                const url = departmentId ? 
                    `/api/departments/${departmentId}` : 
                    '/api/departments';
                
                await fetchWithAuth(url, {
                    method: departmentId ? 'PUT' : 'POST',
                    body: JSON.stringify(Object.fromEntries(formData))
                });

                showToast(`Department ${departmentId ? 'updated' : 'created'} successfully`, 'success');
                closeDepartmentModal();
                await loadDepartments();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });

        // System settings
        document.getElementById('system-settings-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSystemSettings(new FormData(e.target));
        });

        // Logs
        document.getElementById('log-type-filter').addEventListener('change', loadSystemLogs);
        
        document.getElementById('clear-logs-btn').addEventListener('click', async () => {
            if (!confirm('Are you sure you want to clear all logs?')) return;
            
            try {
                await fetchWithAuth('/api/admin/logs', { method: 'DELETE' });
                showToast('Logs cleared successfully', 'success');
                await loadSystemLogs();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });

        // Modal close buttons
        document.querySelectorAll('.cancel-button').forEach(button => {
            button.addEventListener('click', closeDepartmentModal);
        });
    };

    // Initialize timezones
    const initializeTimezones = () => {
        const timezones = moment.tz.names();
        const select = document.querySelector('select[name="timezone"]');
        select.innerHTML = timezones.map(tz => 
            `<option value="${tz}">${tz}</option>`
        ).join('');
    };

    // Modal handling
    const openDepartmentModal = (departmentId = null) => {
        const modal = document.getElementById('department-modal');
        const form = document.getElementById('department-form');
        const title = document.getElementById('department-modal-title');

        title.textContent = departmentId ? 'Edit Department' : 'Add Department';
        
        if (departmentId) {
            const department = departments.find(d => d.id === departmentId);
            if (department) {
                form.name.value = department.name;
                form.description.value = department.description || '';
            }
        } else {
            form.reset();
        }

        form.dataset.departmentId = departmentId;
        modal.classList.remove('hidden');
    };

    const closeDepartmentModal = () => {
        document.getElementById('department-modal').classList.add('hidden');
        document.getElementById('department-form').reset();
    };

    // Helper function for API calls
    const fetchWithAuth = async (url, options = {}) => {
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }
        return response.json();
    };

    // Export functions for global access
    window.editDepartment = openDepartmentModal;
    window.deleteDepartment = async (departmentId) => {
        if (!confirm('Are you sure you want to delete this department?')) return;
        
        try {
            await fetchWithAuth(`/api/departments/${departmentId}`, {
                method: 'DELETE'
            });
            
            showToast('Department deleted successfully', 'success');
            await loadDepartments();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    // Initialize the page
    initialize();
});