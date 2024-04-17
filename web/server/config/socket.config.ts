// Создаем UDP-сокет для отправки и приема RADIUS-пакетов
import dgram from "dgram";

export const socket = dgram.createSocket("udp4");