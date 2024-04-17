document.getElementById('fromDate').addEventListener('change', updateApplyButtonVisibility);
document.getElementById('toDate').addEventListener('change', updateApplyButtonVisibility);
document.getElementById('username').addEventListener('input', updateApplyButtonVisibility);
document.getElementById('applyFiltersButton').addEventListener('click', applyFilters);
document.getElementById('clearFiltersButton').addEventListener('click', clearFilters);
document.getElementById('exportJSONViewSessionsButton').addEventListener('click', exportViewSessions);
async function clearFilters() {
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    document.getElementById('username').value = '';

    updateApplyButtonVisibility();
    await getViewSessions();
}

function updateApplyButtonVisibility() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const username = document.getElementById('username').value;
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
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const username = document.getElementById('username').value;

    await getViewSessions(fromDate, toDate, username);
}

async function getViewSessions(fromDate, toDate, username) {
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

    let baseUrl = `${url}/data/viewSessions`;

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
        fillTable('viewSessions', data);
    } catch (error) {
        showToast('Произошла ошибка при отправке запроса. Пожалуйста, повторите попытку.', error);
    } finally {
        toggleRefreshButton(false)
    }
}

/*============= Экспорт данных =============*/

async function exportViewSessions () {
    toggleRefreshButton(true);
    try {
        const response = await fetch(`${url}/data/viewSessions/export`)
        const data = await response.json();
        const jsonData = JSON.stringify(data);

        const blob = new Blob([jsonData], {type: 'application/json'});
        const exportUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = exportUrl;
        a.download = 'viewSessions.json';
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
    await getViewSessions();
});
