import radius from "radius";
import {socket} from "../config/socket.config.js";
import {radiusConfig} from "../config/radius.config.js";

export const sendRadiusRequest = async (request) => {
    const encodedRequest = radius.encode(request);
    await new Promise((resolve, reject) => {
        socket.send(encodedRequest, 0, encodedRequest.length, radiusConfig.port, radiusConfig.host, (err) => {
            if (err) {
                console.log(`Ошибка при отправке RADIUS-запроса: ${err}`);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export const receiveRadiusResponse = () => {
    return new Promise((resolve) => {
        socket.once('message', (message) => {
            const decodedResponse = radius.decode({packet: message, secret: radiusConfig.secret});
            resolve(decodedResponse);
        });
    });
};