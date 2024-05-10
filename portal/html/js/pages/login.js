function hideAllShowWelcome() {
    document.getElementById('welcome_login').style.display = 'block';
    document.getElementById('successful_login').style.display = 'none';
    document.getElementById('login_form').style.display = 'none';
}

// Показываем login_form после принятия условий
function showLoginForm() {
    document.getElementById('welcome_login').style.display = 'none';
    document.getElementById('login_form').style.display = 'block';
}

function showSuccessfullyLogin() {
    document.getElementById('welcome_login').style.display = 'none';
    document.getElementById('login_form').style.display = 'none';
    document.getElementById('successful_login').style.display = 'block';
}

// Проверяем состояние согласия при загрузке страницы
function checkConsentAndDisplay() {
    if (localStorage.getItem('userConsent')) {
        showLoginForm();
    } else {
        hideAllShowWelcome();
    }
}

// Обновляем обработчик событий для кнопки
document.getElementById('show_login_form').addEventListener('click', function () {
    localStorage.setItem('userConsent', 'true');
    showLoginForm();
});


document.getElementById('google-auth-link').addEventListener("click", async () => {
    try {
        const response = await fetch(`${url}/account/oauth/google/request`, {
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

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    chilliController.onError = handleErrors;
    chilliController.onUpdate = updateUI;

    chilliController.logon(username, password);
});

function updateUI() {
    if (chilliController.clientState === 1) {
        showSuccessfullyLogin();
    } else if (chilliController.clientState === 0 && chilliController.command === 'logon') {
        showToast('Введенные данные неверны', chilliController.clientState);
    }
}

function handleErrors(code) {
    showToast('Ошибка запроса: ' + code, code);
}

document.addEventListener('DOMContentLoaded', () => {
    checkConsentAndDisplay();
    chilliController.refresh();
});

