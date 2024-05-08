document.getElementById('logout').addEventListener('click', async () => {
    try {
        const response = await fetch(`${url}/account/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            window.location.href = 'login.html';
        } else {
            showToast('Ошибка выхода из системы', null);
        }
    } catch (error) {
        showToast(error.message || 'Ошибка выхода из системы', error);
    }
});