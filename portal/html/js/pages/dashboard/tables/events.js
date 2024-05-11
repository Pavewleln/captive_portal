document.getElementById('export_json_events_button').addEventListener('click', exportEvents)

refreshButton.addEventListener('click', getEvents);

async function getEvents() {
    toggleRefreshButton(true);
    try {
        const response = await fetch(`${url}/data/events`, {
            method: "GET", headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await response.json();
        fillTable('events', data);
    } catch (error) {
        showToast('Произошла ошибка при отправке запроса. Пожалуйста, повторите попытку.', error);
    } finally {
        toggleRefreshButton(false)
    }
}

/*============= Экспорт данных =============*/

async function exportEvents() {
    toggleRefreshButton(true);
    try {
        const response = await fetch(`${url}/data/events/export`)
        const data = await response.json();
        const jsonData = JSON.stringify(data);

        const blob = new Blob([jsonData], {type: 'application/json'});
        const exportUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = exportUrl;
        a.download = 'events.json';
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
    await getEvents();
});
