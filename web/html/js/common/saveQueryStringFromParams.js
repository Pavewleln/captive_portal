const saveQueryStringFromParams = () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('res')) {
        sessionStorage.setItem('ip', urlParams.get('ip'));
        sessionStorage.setItem('mac', urlParams.get('mac'));
        sessionStorage.setItem('uamip', urlParams.get('uamip'));
        sessionStorage.setItem('ac_ip', urlParams.get('ac_ip'));
        sessionStorage.setItem('ac_mac', urlParams.get('ac_mac'));
        sessionStorage.setItem('ssid', urlParams.get('ssid'));
        sessionStorage.setItem('accept_callback', urlParams.get('accept_callback'));
        sessionStorage.setItem('userurl', urlParams.get('userurl'));
    }
};