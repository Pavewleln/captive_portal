"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveRadiusResponse = exports.sendRadiusRequest = void 0;
const radius_1 = __importDefault(require("radius"));
const socket_config_1 = require("../config/socket.config");
const radius_config_1 = require("../config/radius.config");
const sendRadiusRequest = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const encodedRequest = radius_1.default.encode(request);
    yield new Promise((resolve, reject) => {
        socket_config_1.socket.send(encodedRequest, 0, encodedRequest.length, radius_config_1.radiusConfig.port, radius_config_1.radiusConfig.host, (err) => {
            if (err) {
                console.log(`Ошибка при отправке RADIUS-запроса: ${err}`);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
});
exports.sendRadiusRequest = sendRadiusRequest;
const receiveRadiusResponse = () => {
    return new Promise((resolve) => {
        socket_config_1.socket.once('message', (message) => {
            const decodedResponse = radius_1.default.decode({ packet: message, secret: radius_config_1.radiusConfig.secret });
            resolve(decodedResponse);
        });
    });
};
exports.receiveRadiusResponse = receiveRadiusResponse;
