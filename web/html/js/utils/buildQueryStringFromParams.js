function buildQueryStringFromParams() {
    const cookieString = document.cookie;
    const cookieParams = cookieString.split(';').reduce((params, cookie) => {
        const [name, value] = cookie.trim().split('=').map(decodeURIComponent);
        params[name] = value;
        return params;
    }, {});

    const client_ip = cookieParams['client-ip'];
    const client_mac = cookieParams['client-mac'];
    const ap_ip = cookieParams['ap-ip'];
    const ap_mac = cookieParams['ap-mac'];
    const ac_ip = cookieParams['ac-ip'];
    const ac_mac = cookieParams['ac-mac'];
    const ssid = cookieParams['ssid'];
    const accept_callback = cookieParams['accept-callback'];
    const redirect_url = cookieParams['redirect-url'];

    const params = new URLSearchParams();
    params.append('client-ip', client_ip);
    params.append('client-mac', client_mac);
    params.append('ap-ip', ap_ip);
    params.append('ap-mac', ap_mac);
    params.append('ac-ip', ac_ip);
    params.append('ac-mac', ac_mac);
    params.append('ssid', ssid);
    params.append('accept-callback', accept_callback);
    params.append('redirect-url', redirect_url);

    return params.toString();
}
