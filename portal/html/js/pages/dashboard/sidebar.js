document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();

    let pageName, navigationItem;
    switch(currentPage) {
        case 'users.html':
            pageName = 'show_users';
            break;
        case 'activeSessions.html':
            pageName = 'show_active_sessions';
            break;
        case 'allSessions.html':
            pageName = 'show_all_sessions';
            break;
        case 'events.html':
            pageName = 'show_events';
            break;
        default:
            return;
    }

    navigationItem = document.getElementById(pageName);
    if(navigationItem) {
        navigationItem.classList.add('active');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const menuButton = document.getElementById('menu_button');
    const mobileNavigation = document.querySelector('.navigation__mobile');

    menuButton.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        mobileNavigation.classList.toggle('active');
    });
});
