import {Request, Response} from "express";
import radius from "radius";
import {socket} from "../config/socket.config";
import dotenv from 'dotenv';
import {radiusConfig} from "../config/radius.config";
import {db} from "../config/db.config";
import {ILoginQueryParams, ILoginRequestParams} from "../types/auth.interface";
import {IRadiusRequest} from "../types/radius.interface";
import {log} from "../utils/logger";
import {
    extractRequestParams,
    handleRadiusAttributes,
    receiveRadiusResponse,
    sendRadiusRequest
} from "../config/login.config";

dotenv.config();

export const Login = async (req: Request, res: Response): Promise<void> => {

    const {username, password} = req.body as { username: string, password: string };
    const {
        clientMac,
        redirectUrl
    } = extractRequestParams(req);

    try {
        const request = {
            code: 'Access-Request',
            secret: radiusConfig.secret,
            attributes: [
                ['User-Name', username],
                ['User-Password', password],
                ['Calling-Station-Id', clientMac]
            ]
        };

        log.info(request)

        await sendRadiusRequest(request);
        const response = await receiveRadiusResponse();

        log.info(response);

        if (response.code === 'Access-Accept') {
            res.status(200).json({...response, redirectUrl});
        } else {
            handleRadiusAttributes(response, res);
        }
    } catch (error) {
        await db.query('ROLLBACK');
        log.error(error);
        res.status(500).json({msg: 'Ошибка сервера. Обратитесь за поддержкой.', error});
    }
};
export const Admin = async (req: Request, res: Response): Promise<void> => {

    const {username, password} = req.body as { username: string, password: string };
    const {
        clientMac
    } = extractRequestParams(req);

    try {

        const request = {
            code: 'Access-Request',
            secret: radiusConfig.secret,
            attributes: [
                ['User-Name', username],
                ['User-Password', password],
                ['Calling-Station-Id', clientMac]
            ]
        };

        log.info(request)

        await sendRadiusRequest(request);
        const response = await receiveRadiusResponse();

        log.info(response);

        if (response.code === 'Access-Accept') {
            const serviceTypeResult = await db.query('SELECT * FROM radcheck WHERE username = $1 AND attribute = $2 AND value = $3', [username, 'Service-Type', 'Administrative-User']);

            if (serviceTypeResult.rows.length > 0) {
                res.status(200).json(response);
            } else {
                res.status(401).json({ msg: "Ошибка авторизации: вы не являетесь администратором", error: "Пользователь не имеет Service-Type 'Administrative'" });
            }
        } else {
            handleRadiusAttributes(response, res);
        }
    } catch (error) {
        await db.query('ROLLBACK');
        log.error(error);
        res.status(500).json({msg: 'Ошибка сервера. Обратитесь за поддержкой.', error});
    }
};

// not working
export const Logout = async (req: Request, res: Response): Promise<void> => {
    try {

    } catch (error) {
        log.error(error);
        res.status(404).json({msg: 'Ошибка сервера: ' + error});
    }
};

// not working
export const Refresh = async (req: Request, res: Response): Promise<void> => {
    try {

    } catch (error) {
        log.error(error);
        res.status(404).json({msg: 'Ошибка сервера: ' + error});
    }
};