// document.getElementById('google-auth-link').addEventListener("click", () => {
//     fetch(`${url}/account/oauth/google/request`, {
//         method: "POST", headers: {
//             "Content-Type": "application/json",
//         }
//     })
//         .then(handleFetchErrors)
//         .then(response => {
//             window.location.href = "dashboard/manageCredentials.html";
//         })
//         .catch(error => {
//             showToastError("Произошла ошибка при отправке запроса. Пожалуйста, повторите попытку", error);
//         });
// });

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
        handleLoginResponse(data, "dashboard/manageCredentials.html");
    } catch (error) {
        showToast(error.msg || "Ошибка авторизации. Проверьте правильность введенных данных", error);
    }
});
