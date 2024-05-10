function buildQueryStringFromParams() {
    const cookieString = document.cookie;
    const cookieParams = cookieString.split(';').reduce((params, cookie) => {
        const [name, value] = cookie.trim().split('=').map(decodeURIComponent);
        params[name] = value;
        return params;
    }, {});

    const params = new URLSearchParams();
    params.append('client-ip', cookieParams['client-ip']);
    params.append('client-mac', cookieParams['client-mac']);
    params.append('ap-ip', cookieParams['ap-ip']);
    params.append('ap-port', cookieParams['ap-port']);
    params.append('ap-mac', cookieParams['ap-mac']);
    params.append('ac-ip', cookieParams['ac-ip']);
    params.append('ac-mac', cookieParams['ac-mac']);
    params.append('ssid', cookieParams['ssid']);
    params.append('accept-callback', cookieParams['accept-callback']);
    params.append('redirect-url', cookieParams['redirect-url']);

    return params.toString();
}