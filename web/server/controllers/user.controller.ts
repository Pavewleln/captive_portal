import {Request, Response} from "express";
import dotenv from 'dotenv';
import {radiusConfig, radiusPacketCode} from "../config/radius.config";
import {db} from "../config/db.config";
import {log} from "../utils/logger";
import {extractRequestParams, handleRadiusAttributes,} from "../config/login.config";
import {receiveRadiusResponse, sendRadiusRequest} from "../utils/radiusProcessing";
import jwt from "jsonwebtoken";

dotenv.config();

class User {
    async login(req: Request, res: Response) {
        const {username, password} = req.body as { username: string, password: string };
        const {clientMac, redirectUrl} = extractRequestParams(req);

        try {
            await db.query("BEGIN");

            const request = {
                code: radiusPacketCode.ACCESS_REQUEST,
                secret: radiusConfig.secret,
                attributes: [
                    ['User-Name', username],
                    ['User-Password', password],
                    ['Calling-Station-Id', clientMac]
                ]
            };

            await sendRadiusRequest(request);
            const response = await receiveRadiusResponse();
            console.log(response)
            if (response.code !== 'Access-Accept') return handleRadiusAttributes(response, res);

            const token = jwt.sign({username}, process.env.SECRET_JWT_KEY ?? "SECRET_KEY", {
                expiresIn: '24h'
            });

            const userRecord = await db.query('SELECT * FROM token WHERE username = $1', [username]);

            if (userRecord.rows.length > 0) {
                await db.query(`
                UPDATE token
                SET token = $1
                WHERE username = $2
            `,
                    [token, username]
                );
            } else {
                await db.query(`
                INSERT INTO token (username, token)
            `,
                    [username, token]
                );
            }

            await db.query("COMMIT");
            res.status(200).json({ user: { username }, token });
        } catch (error) {
            await db.query('ROLLBACK');
            log.error(error);
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
        }
    }

    async admin(req: Request, res: Response) {

        const {username, password} = req.body as { username: string, password: string };
        const {
            clientMac
        } = extractRequestParams(req);

        try {
            const request = {
                code: radiusPacketCode.ACCESS_REQUEST,
                secret: radiusConfig.secret,
                attributes: [
                    ['User-Name', username],
                    ['User-Password', password],
                    ['Calling-Station-Id', clientMac]
                ]
            };

            await sendRadiusRequest(request);
            const response = await receiveRadiusResponse();

            if (response.code !== 'Access-Accept') handleRadiusAttributes(response, res);

            const serviceTypeResult = await db.query('SELECT * FROM radcheck WHERE username = $1 AND attribute = $2 AND value = $3', [username, 'Service-Type', 'Administrative-User']);

            if (serviceTypeResult.rows.length === 0) {
                res.status(401).json({
                    msg: "Ошибка авторизации: вы не являетесь администратором",
                    error: "Пользователь не имеет Service-Type 'Administrative'"
                });
            }

            const token = jwt.sign({username}, process.env.SECRET_JWT_KEY ?? "SECRET_KEY", {
                expiresIn: '24h'
            });

            const userRecord = await db.query('SELECT * FROM token WHERE username = $1', [username]);

            if (userRecord.rows.length > 0) {
                await db.query(`
                UPDATE token
                SET token = $1
                WHERE username = $2
            `,
                    [token, username]
                );
            } else {
                await db.query(`
                INSERT INTO token (username, token)
                VALUES ($1, $2)
            `,
                    [username, token]
                );
            }

            await db.query("COMMIT");
            res.status(200).json({ user: { username }, token });
        } catch (error) {
            await db.query('ROLLBACK');
            log.error(error);
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
        }
    }

    async refresh(req: Request, res: Response) {
        const acctsessionid = req.query.acctsessionid as string;
        try {
            const result = await db.query('UPDATE radacct SET acctsessiontime = now() WHERE acctsessionid = $1 RETURNING *', [acctsessionid]);
            res.status(200).json(result.rows[0]);
        } catch (error) {
            log.error(error);
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
        }
    }

    async verify(req: Request, res: Response) {
        const username = req.username;
        try {
            // Запрос к таблице radcheck
            const radcheckQuery = await db.query(
                `SELECT value AS servicetype 
            FROM radcheck 
            WHERE username = $1 AND attribute = 'Service-Type'`,
                [username]
            );

            // Проверяем, есть ли запись в таблице radcheck
            if (radcheckQuery.rows.length === 0) {
                return res.status(404).json({ msg: 'Пользователь не найден' });
            }

            const servicetype = radcheckQuery.rows[0].servicetype;

            // Запрос к таблице radacct
            const radacctQuery = await db.query(
                `SELECT acctsessionid, acctstarttime, acctsessiontime 
            FROM radacct 
            WHERE username = $1 AND acctstoptime IS NULL`,
                [username]
            );

            // Проверяем, есть ли запись в таблице radacct
            if (radacctQuery.rows.length === 0) {
                return res.status(404).json({ msg: 'Сессия не найдена' });
            }

            const { acctsessionid, acctstarttime, acctsessiontime } = radacctQuery.rows[0];

            // Возвращаем результаты обоих запросов
            res.status(200).json({
                user: {
                    username,
                    servicetype,
                    acctsessionid,
                    acctstarttime,
                    acctsessiontime
                }
            });
        } catch (error) {
            log.error(error);
            await db.query("ROLLBACK");
            res.status(500).json({ msg: 'Ошибка сервера. Попробуйте позже', error });
        }
    }

}

export const user = new User();