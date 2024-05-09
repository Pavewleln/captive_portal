document.getElementById('google-auth-link').addEventListener("click", async () => {
    try {
        const response = await fetch(`${url}/account/oauth/google/request?` + buildQueryStringFromParams(), {
            method: "POST", headers: {
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
    const urlParams = new URLSearchParams(window.location.search);

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    chilliController.host = urlParams.get('uamip');
    chilliController.port = urlParams.get('uamport');
    chilliController.interval = 60;

    chilliController.onError = handleErrors;
    chilliController.onUpdate = updateUI;

        chilliController.logon(username, password);
});

function updateUI(cmd) {
    alert('You called the method' + cmd + '\n Your current state is =' + chilliController.clientState);
}

function handleErrors(code) {
    alert('The last contact with the Controller failed. Error code =' + code);
}

chilliController.refresh();


saveQueryStringFromParams();