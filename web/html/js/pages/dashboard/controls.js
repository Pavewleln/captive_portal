/*============= Обновить таблицу =============*/

const refreshButton = document.getElementById("refreshButton");

refreshButton.addEventListener('click', refresh);

async function refresh() {
    const currentPage = window.location.pathname.split('/').pop();
    toggleRefreshButton(true); // Включить вращение кнопки

    switch (currentPage) {
        case 'manageCredentials.html':
            await getManageCredentials();
            break;
        case 'activeSessions.html':
            await getActiveSessions();
            break;
        case 'viewSessions.html':
            await getViewSessions();
            break;
        default:
            return;
    }

    toggleRefreshButton(false); // Отключить вращение кнопки
}

function toggleRefreshButton(isActive) {
    if (isActive) {
        refreshButton.classList.add("active");
    } else {
        refreshButton.classList.remove("active");
    }
}

document.getElementById("dashboardLogout").addEventListener("click", () => {
    // window.location.href = "/captive_portal/html/dashboard.html";
});
