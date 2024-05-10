export const extractRequestParams = (req) => {
    const {
        'client-ip': clientIp,
        'client-mac': clientMac,
        'ap-ip': apIp,
        'ap-mac': apMac,
        'ac-ip': acIp,
        'ac-mac': acMac,
        ssid,
        'accept-callback': acceptCallback,
        'redirect-url': redirectUrl,
        'ap-port': apPort
    } = req.query

    return {clientMac, clientIp, apIp, apMac, acIp, acMac, ssid, acceptCallback, redirectUrl, apPort};
};