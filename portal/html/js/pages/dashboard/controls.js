/*============= Обновить таблицу =============*/

const refreshButton = document.getElementById("refresh_button");

function toggleRefreshButton(isActive) {
    if (isActive) {
        refreshButton.classList.add("active");
    } else {
        refreshButton.classList.remove("active");
    }
}

document.getElementById("dashboard_logout").addEventListener("click", () => {
    chilliController.onError = handleErrors;
    chilliController.onUpdate = updateUIAdmin;
    chilliController.logoff();
});

function updateUIAdmin() {
    if (chilliController.clientState === 1) {
        window.location.href = "users.html";
    } else if (chilliController.clientState === 0 && chilliController.command === 'logon') {
        showToast('Введенные данные неверны', chilliController.clientState);
    } else if (chilliController.clientState === 0 && chilliController.command === 'logoff') {
        showToast('Сеанс окончен', chilliController.clientState);
        window.location.href = "index.html";
        showUserForm();
    } else {
        window.location.href = "index.html";
        showUserForm();
    }
}

function handleErrors(code) {
    showToast('Ошибка: ' + code, code);
}

document.addEventListener('DOMContentLoaded', () => {
    addQueryParamsToUrl();
    chilliController.onUpdate = updateUIAdmin;
    chilliController.onError = handleErrors;
    chilliController.debug = true;
    chilliController.refresh();
})