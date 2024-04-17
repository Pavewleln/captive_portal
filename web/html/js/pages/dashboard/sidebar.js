document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop(); // Получаем имя текущей страницы из URL

    // Определяем название страницы и соответствующий элемент навигации
    let pageName, navigationItem;
    switch(currentPage) {
        case 'manageCredentials.html':
            pageName = 'showManageCredentials';
            break;
        case 'activeSessions.html':
            pageName = 'showActiveSessions';
            break;
        case 'viewSessions.html':
            pageName = 'showViewSessions';
            break;
        default:
            return; // Выйти из функции, если страница не соответствует ни одному из ожидаемых значений
    }

    // Добавляем класс active соответствующему элементу навигации
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
