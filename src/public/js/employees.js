document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 0;
    let employees = [];
    let departments = [];
    let filters = {
        search: '',
        department: '',
        role: '',
        status: ''
    };

    // DOM elements
    const employeesTableBody = document.getElementById('employees-table-body');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const employeeModal = document.getElementById('employee-modal');
    const employeeForm = document.getElementById('employee-form');
    const cancelButton = document.getElementById('cancel-button');
    const searchInput = document.getElementById('search-input');
    const departmentFilter = document.getElementById('department-filter');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');
    const pageSizeSelect = document.getElementById('page-size');

    // Initialize
    const initialize = async () => {
        try {
            // Load departments
            departments = await utils.fetchWithAuth('/api/departments');
            populateDepartmentDropdowns();

            // Load initial employees
            await loadEmployees();

            // Set up event listeners
            setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            showToast('Failed to initialize page', 'error');
        }
    };

    // Load employees with filtering and pagination
    const loadEmployees = async () => {
        try {
            showLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: pageSize,
                ...filters
            });

            const response = await utils.fetchWithAuth(`/api/users?${queryParams}`);
            employees = response.data;
            totalPages = Math.ceil(response.total / pageSize);

            renderEmployees();
            renderPagination();
        } catch (error) {
            console.error('Error loading employees:', error);
            showToast('Failed to load employees', 'error');
        } finally {
            showLoading(false);
        }
    };

    // Render employees table
    const renderEmployees = () => {
        employeesTableBody.innerHTML = employees.map(employee => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" 
                                src="${employee.profilePicture || '/images/default-avatar.png'}" 
                                alt="${employee.firstName}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                                ${employee.firstName} ${employee.lastName}
                            </div>
                            <div class="text-sm text-gray-500">
                                ${employee.email}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${departments.find(d => d.id === employee.departmentId)?.name || 'N/A'}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        ${employee.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="editEmployee('${employee.id}')" 
                        class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onclick="deleteEmployee('${employee.id}')" 
                        class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    };

    // Render pagination controls
    const renderPagination = () => {
        const paginationControls = document.getElementById('pagination-controls');
        let html = '';

        if (totalPages > 1) {
            html += `
                <button 
                    onclick="changePage(${currentPage - 1})" 
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    ${currentPage === 1 ? 'disabled' : ''}>
                    Previous
                </button>
            `;

            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    html += `
                        <button 
                            onclick="changePage(${i})"
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium
                                ${currentPage === i ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}">
                            ${i}
                        </button>
                    `;
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                    html += `<span class="px-2 py-2">...</span>`;
                }
            }

            html += `
                <button 
                    onclick="changePage(${currentPage + 1})"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                    Next
                </button>
            `;
        }

        paginationControls.innerHTML = html;
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Add employee button
        addEmployeeBtn.addEventListener('click', () => {
            openModal();
        });

        // Cancel button
        cancelButton.addEventListener('click', () => {
            closeModal();
        });

        // Form submission
        employeeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmit(e);
        });

        // Filters
        const applyFilters = utils.debounce(() => {
            filters = {
                search: searchInput.value,
                department: departmentFilter.value,
                role: roleFilter.value,
                status: statusFilter.value
            };
            currentPage = 1;
            loadEmployees();
        }, 300);

        searchInput.addEventListener('input', applyFilters);
        departmentFilter.addEventListener('change', applyFilters);
        roleFilter.addEventListener('change', applyFilters);
        statusFilter.addEventListener('change', applyFilters);

        // Page size
        pageSizeSelect.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value);
            currentPage = 1;
            loadEmployees();
        });
    };

    // Modal handling
    const openModal = (employeeId = null) => {
        const modalTitle = document.getElementById('modal-title');
        modalTitle.textContent = employeeId ? 'Edit Employee' : 'Add Employee';

        if (employeeId) {
            const employee = employees.find(e => e.id === employeeId);
            if (employee) {
                populateForm(employee);
            }
        } else {
            employeeForm.reset();
        }

        employeeForm.dataset.employeeId = employeeId;
        employeeModal.classList.remove('hidden');
    };

    const closeModal = () => {
        employeeModal.classList.add('hidden');
        employeeForm.reset();
        delete employeeForm.dataset.employeeId;
    };

    // Form handling
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(employeeForm);
            const employeeId = employeeForm.dataset.employeeId;
            const url = employeeId ? `/api/users/${employeeId}` : '/api/users';
            const method = employeeId ? 'PUT' : 'POST';

            showLoading(true);
            await utils.fetchWithAuth(url, {
                method,
                body: formData
            });

            showToast(`Employee ${employeeId ? 'updated' : 'added'} successfully`, 'success');
            closeModal();
            await loadEmployees();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            showLoading(false);
        }
    };

    // Populate department dropdowns
    const populateDepartmentDropdowns = () => {
        const options = departments.map(dept => 
            `<option value="${dept.id}">${dept.name}</option>`
        ).join('');

        departmentFilter.innerHTML = '<option value="">All Departments</option>' + options;
        document.querySelector('select[name="departmentId"]').innerHTML = options;
    };

    // Populate form for editing
    const populateForm = (employee) => {
        const form = employeeForm;
        form.firstName.value = employee.firstName;
        form.lastName.value = employee.lastName;
        form.email.value = employee.email;
        form.departmentId.value = employee.departmentId;
        form.role.value = employee.role;
        form.isActive.value = employee.isActive.toString();
    };

    // Change page
    window.changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            loadEmployees();
        }
    };

    // Delete employee
    window.deleteEmployee = async (employeeId) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                showLoading(true);
                await utils.fetchWithAuth(`/api/users/${employeeId}`, {
                    method: 'DELETE'
                });
                
                showToast('Employee deleted successfully', 'success');
                await loadEmployees();
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                showLoading(false);
            }
        }
    };

    // Edit employee
    window.editEmployee = (employeeId) => {
        openModal(employeeId);
    };

    // Initialize the page
    initialize();
});