function handleFetchErrors(response) {
    if (!response.ok) {
        throw new Error('Произошла ошибка при выполнении запроса');
    }
    return response.json().then(data => ({ data, status: response.status }));
}

function handleLoginResponse(responseData, redirectUrl) {
    if (responseData && responseData.code === "Access-Accept") {
        window.location.href = redirectUrl;
    } else {
        showToast(responseData ? responseData.msg : "Ошибка авторизации. Проверьте введенные данные.", responseData.error);
    }
}