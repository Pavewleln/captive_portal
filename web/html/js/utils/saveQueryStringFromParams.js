const saveQueryStringFromParams = () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('res')) {
        document.cookie = `client-ip=${urlParams.get('ip')};`;
        document.cookie = `client-mac=${urlParams.get('mac')};`;
        document.cookie = `ap-ip=${urlParams.get('uamip')};`;
        document.cookie = `ap-port=${urlParams.get('uamport')}`;
        document.cookie = `ap-mac=${urlParams.get('called')};`;
        document.cookie = `ac-ip=${urlParams.get('ac-ip')};`;
        document.cookie = `ac-mac=${urlParams.get('ac-mac')};`;
        document.cookie = `ssid=${urlParams.get('ssid')};`;
        document.cookie = `accept-callback=${urlParams.get('accept-callback')};`;
        document.cookie = `redirect-url=${urlParams.get('userurl')};`;
    }
};
