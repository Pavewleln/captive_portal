/*============= Обновить таблицу =============*/

const refreshButton = document.getElementById("refreshButton");

function toggleRefreshButton(isActive) {
    if (isActive) {
        refreshButton.classList.add("active");
    } else {
        refreshButton.classList.remove("active");
    }
}

document.getElementById("dashboardLogout").addEventListener("click", () => {
    // window.location.href = "/captive_portal/html/admin.html";
});
