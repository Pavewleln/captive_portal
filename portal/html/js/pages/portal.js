// Получаем элементы форм и ссылки перехода
const userLoginForm = document.getElementById('login_form');
const successfullyLoginForm = document.getElementById('successfully_login');
const adminLoginForm = document.getElementById('admin_form');
const userLink = document.querySelector('.login-link[href="#user"]');
const adminLink = document.querySelector('.login-link[href="#admin"]');

function showUserForm() {
    successfullyLoginForm.style.display = 'none'
    adminLoginForm.style.display = 'none';
    userLoginForm.style.display = 'block';
}

function showAdminForm() {
    successfullyLoginForm.style.display = 'none'
    userLoginForm.style.display = 'none';
    adminLoginForm.style.display = 'block';
}

function showSuccessfullyLogin() {
    userLoginForm.style.display = 'none';
    adminLoginForm.style.display = 'none';
    successfullyLoginForm.style.display = 'block'
}

userLink.addEventListener('click', (e) => {
    e.preventDefault();
    showUserForm();
});

adminLink.addEventListener('click', (e) => {
    e.preventDefault();
    showAdminForm();
});

document.getElementById('login_google_auth_link').addEventListener("click", async () => {
    const urlParams = new URLSearchParams(window.location.search);

    try {
        const response = await fetch(`${url}/account/oauth/google/request?client-mac=${urlParams.get('mac')}`, {
            method: "POST", headers: {
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();
        window.location.href = data.redirectUrl;
    } catch (error) {
        showToast(error.message || "Произошла ошибка при запросе авторизации через Google.", error);
    }
});

document.getElementById("login_form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("user_username").value;
    const password = document.getElementById("user_password").value;

    chilliController.onError = handleErrors;
    chilliController.onUpdate = updateUILogin;

    chilliController.logon(username, password);
});

document.getElementById("admin_form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("admin_username").value;
    const password = document.getElementById("admin_password").value;

    try {
       const response = await fetch(`${url}/account/admin`, {
           method: "POST", headers: {
               "Content-Type": "application/json",
           }, body: JSON.stringify({username, password})
       });

       const data = await response.json();
       if (data.user.username && data.user.password) {
            chilliController.onError = handleErrors;
            chilliController.onUpdate = updateUIAdmin;
            chilliController.logon(username, password);
       } else {
           showToast(data.msg || "Ошибка авторизации. Проверьте правильность введенных данных");
       }
    } catch (error) {
        showToast(error.msg || "Ошибка авторизации. Проверьте правильность введенных данных", error);
    }
});

document.getElementById("logoff").addEventListener("click", async () => {
    chilliController.onError = handleErrors;
    chilliController.onUpdate = updateUILogin;
    chilliController.logoff();
})

function updateUILogin() {
    if (chilliController.clientState === 1) {
        showSuccessfullyLogin();
        const profile_username = document.getElementById('profile_username');
        profile_username.innerHTML = chilliController.session.userName;
    } else if (chilliController.clientState === 0 && chilliController.command === 'logon') {
        showToast('Введенные данные неверны', chilliController.clientState);
    } else if (chilliController.clientState === 0 && chilliController.command === 'logoff') {
        showToast('Сеанс окончен', chilliController.clientState);
        showUserForm();
    }else {
        showUserForm();
    }
}

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
    showUserForm();
    chilliController.onUpdate = updateUILogin;
    chilliController.onError = handleErrors;
    chilliController.debug = true;
    chilliController.refresh();

    const username = getCookie('username');
    const password = getCookie('password');
    if (username && password) {
        chilliController.logon(username, password);
    }

    saveQueryParams();
});
