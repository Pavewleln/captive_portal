import {pino} from 'pino';
import dayjs from 'dayjs';

export const log = pino({
    timestamp: () => `,"time":"${dayjs().format()}"`,
});
