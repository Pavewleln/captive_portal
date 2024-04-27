"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
// Создаем UDP-сокет для отправки и приема RADIUS-пакетов
const dgram_1 = __importDefault(require("dgram"));
exports.socket = dgram_1.default.createSocket("udp4");
