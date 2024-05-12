document.getElementById('export_json_active_sessions_button').addEventListener('click', exportActiveSessions)
refreshButton.addEventListener('click', getActiveSessions);

async function getActiveSessions() {
    toggleRefreshButton(true);
    try {
        const response = await fetch(`${url}/data/active-sessions`, {
            method: "GET", headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await response.json();
        fillTable('active_sessions', data);
    } catch (error) {
        showToast('Произошла ошибка при отправке запроса. Пожалуйста, повторите попытку.', error);
    } finally {
        toggleRefreshButton(false)
    }
}

/*============= Экспорт данных =============*/

async function exportActiveSessions() {
    toggleRefreshButton(true);
    try {
        const response = await fetch(`${url}/data/active-sessions/export`)
        const data = await response.json();
        const jsonData = JSON.stringify(data);

        const blob = new Blob([jsonData], {type: 'application/json'});
        const exportUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = exportUrl;
        a.download = 'activeSessions.json';
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

/*============= Завершение сессии =============*/

async function handleEndSessionClick(row) {
    try {
        // chilliController.logoff(row.getAttribute('data-macaddress'));
        // closeAllPopups();
        // const nextElement = row.nextElementSibling;
        // if (nextElement && nextElement.classList.contains('tooltip')) {
        //     nextElement.remove();
        // }
        // row.remove();
    } catch (error) {
        showToast('Ошибка при удалении данных. Пожалуйста, повторите попытку.', error);
    }
}


/*============= tooltip =============*/

function createTooltipContent(macaddress) {
    return `
        <div class="tooltip__controls">
            <button class="tooltip__controls-end-session" data-macaddress="${macaddress}" id="end_session_button" style="color: red;">Завершить сессию</button>
        </div>
    `;
}

function toggleTooltip(row) {
    const tooltip = row.nextElementSibling;
    if (tooltip && tooltip.classList.contains('tooltip')) {
        tooltip.remove();
    } else {
        const existingTooltips = document.querySelectorAll('.tooltip');
        existingTooltips.forEach((existingTooltip) => existingTooltip.remove());

        const acctuniqueid = row.getAttribute('data-acctuniqueid');

        const tooltipRow = document.createElement('tr');
        tooltipRow.classList.add('tooltip');
        tooltipRow.setAttribute('data-acctuniqueid', acctuniqueid);

        const tooltipCell = document.createElement('td');
        tooltipCell.colSpan = row.cells.length;
        tooltipRow.appendChild(tooltipCell);

        const tooltipContent = document.createElement('div');
        tooltipContent.classList.add('tooltip__content');

        tooltipContent.innerHTML = createTooltipContent(acctuniqueid);

        const endSessionButton = tooltipContent.querySelector('#end_session_button');
        endSessionButton.addEventListener('click', () => handleEndSessionClick(row));

        tooltipCell.appendChild(tooltipContent);
        row.insertAdjacentElement('afterend', tooltipRow);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await getActiveSessions();
});