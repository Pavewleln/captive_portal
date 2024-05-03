function updateUserInfo(userData) {
    const usernameElement = document.getElementById('username');
    const sessionTimeoutElement = document.getElementById('session-timeout');

    usernameElement.textContent = userData.username;

    const remainingTime = Math.max(0, userData.acctsessiontime - (Date.now() - new Date(userData.acctstarttime).getTime()) / 1000);
    sessionTimeoutElement.textContent = remainingTime.toFixed(0);

    if (remainingTime <= 0) {
        showToast('Время сеанса истекло. Перенаправление.', null);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

async function fetchUserData() {
    try {
        const response = await fetch(`${url}/account/session?` + buildQueryStringFromParams());
        const data = await response.json();

        if (data.user) {
            updateUserInfo(data.user);
        } else {
            showToast('Ошибка получения данных пользователя', null);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    } catch (error) {
        showToast(error.message || 'Ошибка получения данных пользователя', error);
    }
}


window.addEventListener('DOMContentLoaded', fetchUserData);