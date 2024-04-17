import {IRadiusRequest} from "../types/radius.interface";
import radius from "radius";
import {socket} from "./socket.config";
import {radiusConfig} from "./radius.config";
import {log} from "../utils/logger";
import {Request, Response} from "express";
import {ILoginQueryParams, ILoginRequestParams} from "../types/auth.interface";

export const sendRadiusRequest = async (request: IRadiusRequest): Promise<void> => {
    const encodedRequest = radius.encode(request);
    await new Promise<void>((resolve, reject) => {
        socket.send(
            encodedRequest,
            0,
            encodedRequest.length,
            radiusConfig.port,
            radiusConfig.host,
            (err) => {
                if (err) {
                    log.error(`Ошибка при отправке RADIUS-запроса: ${err}`);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
};

export const receiveRadiusResponse = (): Promise<radius.RadiusPacket> => {
    return new Promise<radius.RadiusPacket>((resolve) => {
        socket.once('message', (message) => {
            const decodedResponse = radius.decode({packet: message, secret: radiusConfig.secret});
            resolve(decodedResponse);
        });
    });
};

export const extractRequestParams = (req: Request): ILoginRequestParams => {
    const {
        'client-ip': clientIp,
        'client-mac': clientMac,
        'ap-ip': apIp,
        'ap-mac': apMac,
        'ac-ip': acIp,
        'ac-mac': acMac,
        ssid,
        'accept-callback': acceptCallback,
        'redirect-url': redirectUrl
    } = req.query as unknown as ILoginQueryParams;

    return {clientMac, clientIp, apIp, apMac, acIp, acMac, ssid, acceptCallback, redirectUrl};
};

export const handleRadiusAttributes = (response: radius.RadiusPacket, res: Response): void => {
    const replyMessage: string = response.attributes['Reply-Message'];

    if (replyMessage === 'Auth-Failed') {
        res.status(401).json({
            msg: "Ошибка авторизации: Проверьте верность введенных данных",
            error: "Аутентификация не удалась"
        });
    } else if (replyMessage === 'MAC-Added') {
        res.status(200).json(response);
    } else if (replyMessage === 'MAC-Failed') {
        res.status(401).json({
            msg: "Ошибка авторизации: проверка MAC-адреса не пройдена",
            error: "Проверка MAC-адреса не пройдена"
        });
    } else {
        res.status(401).json({
            msg: "Ошибка авторизации. Проверьте правильность введенных данных",
            error: "Ответ RADIUS не подтверждает доступ"
        });
    }
}