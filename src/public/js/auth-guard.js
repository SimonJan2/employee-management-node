document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
        return;
    }

    // Update user info in navigation
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    if (userAvatar) {
        userAvatar.src = user.profilePicture || '/images/default-avatar.png';
    }
    if (userName) {
        userName.textContent = `${user.firstName} ${user.lastName}`;
    }

    // Handle admin-only elements
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    if (user.role !== 'admin') {
        adminOnlyElements.forEach(el => el.style.display = 'none');
    }

    // Add logout functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        });
    }

    // Set active navigation item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});