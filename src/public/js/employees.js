document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 0;
    let employees = [];
    let departments = [];

    // Elements
    const employeesTableBody = document.getElementById('employees-table-body');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const employeeModal = document.getElementById('employee-modal');
    const employeeForm = document.getElementById('employee-form');
    const searchInput = document.getElementById('search-input');
    const departmentFilter = document.getElementById('department-filter');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');
    const pageSizeSelect = document.getElementById('page-size');

    // Initialize
    const initialize = async () => {
        try {
            await Promise.all([
                loadDepartments(),
                loadEmployees()
            ]);
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
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load employees');
            employees = await response.json();
            renderEmployees();
        } catch (error) {
            console.error('Error loading employees:', error);
            showToast('Failed to load employees', 'error');
        } finally {
            showLoading(false);
        }
    };

    // Load departments
    const loadDepartments = async () => {
        try {
            const response = await fetch('/api/departments', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load departments');
            departments = await response.json();
            populateDepartmentDropdowns();
        } catch (error) {
            console.error('Error loading departments:', error);
            showToast('Failed to load departments', 'error');
        }
    };

    // Render employees table
    const renderEmployees = () => {
        if (employees.length === 0) {
            employeesTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        No employees found
                    </td>
                </tr>
            `;
            return;
        }

        employeesTableBody.innerHTML = employees.map(employee => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                            <img class="h-10 w-10 rounded-full" src="${employee.profilePicture || '/images/default-avatar.png'}" alt="">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${employee.firstName} ${employee.lastName}</div>
                            <div class="text-sm text-gray-500">${employee.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${getDepartmentName(employee.departmentId)}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        ${employee.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
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

    // Helper function to get department name
    const getDepartmentName = (departmentId) => {
        const department = departments.find(d => d.id === departmentId);
        return department ? department.name : 'N/A';
    };

    // Populate department dropdowns
    const populateDepartmentDropdowns = () => {
        const options = departments.map(dept => 
            `<option value="${dept.id}">${dept.name}</option>`
        ).join('');

        departmentFilter.innerHTML = '<option value="">All Departments</option>' + options;
        document.querySelector('select[name="departmentId"]').innerHTML = options;
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Add employee button
        addEmployeeBtn.addEventListener('click', () => {
            openModal();
        });

        // Form submission
        employeeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmit(e);
        });

        // Modal close buttons
        document.querySelectorAll('.cancel-button').forEach(button => {
            button.addEventListener('click', closeModal);
        });

        // Filters
        const applyFilters = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const departmentValue = departmentFilter.value;
            const roleValue = roleFilter.value;
            const statusValue = statusFilter.value;

            const filteredEmployees = employees.filter(employee => {
                const matchesSearch = (
                    employee.firstName.toLowerCase().includes(searchTerm) ||
                    employee.lastName.toLowerCase().includes(searchTerm) ||
                    employee.email.toLowerCase().includes(searchTerm)
                );
                const matchesDepartment = !departmentValue || employee.departmentId === departmentValue;
                const matchesRole = !roleValue || employee.role === roleValue;
                const matchesStatus = statusValue === '' || employee.isActive === (statusValue === 'true');

                return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
            });

            renderFilteredEmployees(filteredEmployees);
        };

        searchInput.addEventListener('input', applyFilters);
        departmentFilter.addEventListener('change', applyFilters);
        roleFilter.addEventListener('change', applyFilters);
        statusFilter.addEventListener('change', applyFilters);

        // Page size
        pageSizeSelect.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value);
            currentPage = 1;
            applyFilters();
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

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (!response.ok) throw new Error('Failed to save employee');

            showToast(`Employee ${employeeId ? 'updated' : 'added'} successfully`, 'success');
            closeModal();
            await loadEmployees();
        } catch (error) {
            console.error('Error saving employee:', error);
            showToast(error.message, 'error');
        }
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

    // Delete employee
    window.deleteEmployee = async (employeeId) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        try {
            const response = await fetch(`/api/users/${employeeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to delete employee');

            showToast('Employee deleted successfully', 'success');
            await loadEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            showToast(error.message, 'error');
        }
    };

    // Edit employee
    window.editEmployee = (employeeId) => {
        openModal(employeeId);
    };

    // Render filtered employees
    const renderFilteredEmployees = (filteredEmployees) => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginatedEmployees = filteredEmployees.slice(start, end);
        
        totalPages = Math.ceil(filteredEmployees.length / pageSize);
        renderEmployees(paginatedEmployees);
        renderPagination();
    };

    // Initialize the page
    initialize();
});