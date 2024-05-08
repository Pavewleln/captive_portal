document.getElementById('google-auth-link').addEventListener("click", async () => {
    try {
        const response = await fetch(`${url}/account/oauth/google/request?` + buildQueryStringFromParams(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();
        window.location.href = data.redirectUrl;
    } catch (error) {
        showToast(error.message || "Произошла ошибка при запросе авторизации через Google.", error);
    }
});

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    try {
        const response = await fetch(`${url}/account/login?` + buildQueryStringFromParams(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password})
        });

        const data = await response.json();
        if (data.user && data.user.username) {
            window.location.href = "index.html";
        } else {
            showToast(data.msg || "Ошибка авторизации. Проверьте правильность введенных данных");
        }
    } catch (error) {
        showToast(error.message || "Ошибка авторизации. Проверьте правильность введенных данных", error);
    }
});



saveQueryStringFromParams();