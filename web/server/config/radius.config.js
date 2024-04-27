"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.radiusPacketCode = exports.radiusConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.radiusConfig = {
    secret: process.env.RADIUS_SECRET || "testing123",
    port: parseInt(process.env.RADIUS_PORT || "") || 1812,
    host: process.env.RADIUS_HOST || "127.0.0.1",
};
var radiusPacketCode;
(function (radiusPacketCode) {
    radiusPacketCode["ACCESS_REQUEST"] = "Access-Request";
    radiusPacketCode["ACCOUNTING_REQUEST"] = "Accounting-Request";
})(radiusPacketCode || (exports.radiusPacketCode = radiusPacketCode = {}));
