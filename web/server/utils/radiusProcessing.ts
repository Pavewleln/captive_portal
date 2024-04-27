import {IRadiusRequest} from "../types/radius.interface";
import radius from "radius";
import {socket} from "../config/socket.config";
import {radiusConfig} from "../config/radius.config";

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
                    console.log(`Ошибка при отправке RADIUS-запроса: ${err}`);
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