function buildQueryStringFromParams() {
    const client_ip = sessionStorage.getItem('ip');
    const client_mac = sessionStorage.getItem('mac');
    const ap_ip = sessionStorage.getItem('uamip');
    const ap_mac = sessionStorage.getItem('uamip');
    const ac_ip = sessionStorage.getItem('ac_ip');
    const ac_mac = sessionStorage.getItem('ac_mac');
    const ssid = sessionStorage.getItem('ssid');
    const accept_callback = sessionStorage.getItem('accept_callback');
    const redirect_url = sessionStorage.getItem('userurl');

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
