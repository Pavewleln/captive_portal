document.getElementById("adminForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${url}/account/admin?` + buildQueryStringFromParams(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (data.user && data.user.username) {
            window.location.href = "dashboard/manageCredentials.html";
        } else {
            showToast("Ошибка авторизации. Проверьте правильность введенных данных");
        }
    } catch (error) {
        showToast(error.msg || "Ошибка авторизации. Проверьте правильность введенных данных", error);
    }
});
