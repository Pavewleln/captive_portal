document.getElementById('fromDateField').addEventListener('change', updateApplyButtonVisibility);
document.getElementById('toDateField').addEventListener('change', updateApplyButtonVisibility);
document.getElementById('usernameField').addEventListener('input', updateApplyButtonVisibility);
document.getElementById('applyFiltersButton').addEventListener('click', applyFilters);
document.getElementById('clearFiltersButton').addEventListener('click', clearFilters);
document.getElementById('exportJSONAllSessionsButton').addEventListener('click', exportAllSessions);

refreshButton.addEventListener('click', getAllSessions);
async function clearFilters() {
    document.getElementById('fromDateField').value = '';
    document.getElementById('toDateField').value = '';
    document.getElementById('usernameField').value = '';

    updateApplyButtonVisibility();
    await getAllSessions();
}

function updateApplyButtonVisibility() {
    const fromDate = document.getElementById('fromDateField').value;
    const toDate = document.getElementById('toDateField').value;
    const username = document.getElementById('usernameField').value;
    const applyButton = document.getElementById('applyFiltersButton');
    const clearButton = document.getElementById('clearFiltersButton');

    if (fromDate.trim() !== '' || toDate.trim() !== '' || username.trim() !== '') {
        applyButton.classList.add('visible');
        applyButton.classList.remove('invisible');
        clearButton.classList.add('visible');
        clearButton.classList.remove('invisible');
    } else {
        applyButton.classList.add('invisible');
        applyButton.classList.remove('visible');
        clearButton.classList.add('invisible');
        clearButton.classList.remove('visible');
    }
}

async function applyFilters() {
    const fromDate = document.getElementById('fromDateField').value;
    const toDate = document.getElementById('toDateField').value;
    const username = document.getElementById('usernameField').value;

    await getAllSessions(fromDate, toDate, username);
}

async function getAllSessions(fromDate, toDate, username) {
    let urlParams = new URLSearchParams();

    if (fromDate) {
        urlParams.append('fromDate', fromDate);
    }

    if (toDate) {
        urlParams.append('toDate', toDate);
    }

    if (username) {
        urlParams.append('username', username.trim());
    }

    let baseUrl = `${url}/data/all-sessions`;

    if (urlParams.toString()) {
        baseUrl += `?${urlParams.toString()}`;
    }

    toggleRefreshButton(true);
    try {
        const response = await fetch(baseUrl, {
            method: 'GET', headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await response.json();
        fillTable('allSessions', data);
    } catch (error) {
        showToast('Произошла ошибка при отправке запроса. Пожалуйста, повторите попытку.', error);
    } finally {
        toggleRefreshButton(false)
    }
}

/*============= Экспорт данных =============*/

async function exportAllSessions () {
    toggleRefreshButton(true);
    try {
        const response = await fetch(`${url}/data/all-sessions/export`)
        const data = await response.json();
        const jsonData = JSON.stringify(data);

        const blob = new Blob([jsonData], {type: 'application/json'});
        const exportUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = exportUrl;
        a.download = 'all-sessions.json';
        document.body.appendChild(a);
        a.click();

        URL.revokeObjectURL(exportUrl);
        document.body.removeChild(a);
    } catch (error) {
        showToast(error.message || "Ошибка загрузки. Проверьте правильность введенных данных", error);
    } finally {
        toggleRefreshButton(false);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await getAllSessions();
});
