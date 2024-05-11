document.getElementById('from_date_field').addEventListener('change', updateApplyButtonVisibility);
document.getElementById('to_date_field').addEventListener('change', updateApplyButtonVisibility);
document.getElementById('username_field').addEventListener('input', updateApplyButtonVisibility);
document.getElementById('apply_filters_button').addEventListener('click', applyFilters);
document.getElementById('clear_filters_button').addEventListener('click', clearFilters);
document.getElementById('export_json_all_sessions_button').addEventListener('click', exportAllSessions);

refreshButton.addEventListener('click', getAllSessions);
async function clearFilters() {
    document.getElementById('from_date_field').value = '';
    document.getElementById('to_date_field').value = '';
    document.getElementById('username_field').value = '';

    updateApplyButtonVisibility();
    await getAllSessions();
}

function updateApplyButtonVisibility() {
    const fromDate = document.getElementById('from_date_field').value;
    const toDate = document.getElementById('to_date_field').value;
    const username = document.getElementById('username_field').value;
    const applyButton = document.getElementById('apply_filters_button');
    const clearButton = document.getElementById('clear_filters_button');

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
    const fromDate = document.getElementById('from_date_field').value;
    const toDate = document.getElementById('to_date_field').value;
    const username = document.getElementById('username_field').value;

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
        fillTable('all_sessions', data);
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
        a.download = 'allSessions.json';
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
