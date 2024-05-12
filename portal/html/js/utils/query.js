function saveQueryParams(){
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (let param of searchParams.entries()) {
        params[param[0]] = param[1];
    }

    localStorage.setItem('query_params', JSON.stringify(params));
}

function addQueryParamsToUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (let param of searchParams.entries()) {
        params[param[0]] = param[1];
    }

    const prevParams = JSON.parse(localStorage.getItem('query_params')) || {};
    const newParams = Object.assign({}, prevParams, params);
    localStorage.setItem('query_params', JSON.stringify(newParams));
    const newUrl = window.location.pathname + '?' + new URLSearchParams(newParams).toString();
    window.history.replaceState({}, '', newUrl);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}