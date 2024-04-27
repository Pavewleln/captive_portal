"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRadiusAttributes = exports.extractRequestParams = void 0;
const extractRequestParams = (req) => {
    const { 'client-ip': clientIp, 'client-mac': clientMac, 'ap-ip': apIp, 'ap-mac': apMac, 'ac-ip': acIp, 'ac-mac': acMac, ssid, 'accept-callback': acceptCallback, 'redirect-url': redirectUrl } = req.query;
    return { clientMac, clientIp, apIp, apMac, acIp, acMac, ssid, acceptCallback, redirectUrl };
};
exports.extractRequestParams = extractRequestParams;
const handleRadiusAttributes = (response, res) => {
    const replyMessage = response.attributes['Reply-Message'];
    if (replyMessage === 'Auth-Failed') {
        res.status(401).json({
            msg: "Ошибка авторизации: Проверьте верность введенных данных",
            error: "Аутентификация не удалась"
        });
    }
    else if (replyMessage === 'MAC-Added') {
        res.status(200).json(response);
    }
    else if (replyMessage === 'MAC-Failed') {
        res.status(401).json({
            msg: "Ошибка авторизации: проверка MAC-адреса не пройдена",
            error: "Проверка MAC-адреса не пройдена"
        });
    }
    else {
        res.status(401).json({
            msg: "Ошибка авторизации. Проверьте правильность введенных данных",
            error: "Ответ RADIUS не подтверждает доступ"
        });
    }
};
exports.handleRadiusAttributes = handleRadiusAttributes;