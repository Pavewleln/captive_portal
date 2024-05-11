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
    // window.location.href = "/captive_portal/html/admin.html";
});
