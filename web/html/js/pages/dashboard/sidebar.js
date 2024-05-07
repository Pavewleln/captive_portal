document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();

    let pageName, navigationItem;
    switch(currentPage) {
        case 'users.html':
            pageName = 'showUsers';
            break;
        case 'activeSessions.html':
            pageName = 'showActiveSessions';
            break;
        case 'allSessions.html':
            pageName = 'showAllSessions';
            break;
        case 'events.html':
            pageName = 'showEvents';
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
    const menuButton = document.getElementById('menuButton');
    const mobileNavigation = document.querySelector('.navigation__mobile');

    menuButton.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        mobileNavigation.classList.toggle('active');
    });
});
