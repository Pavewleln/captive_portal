import dotenv from 'dotenv';
import {radiusConfig} from "../config/radius.config.js";
import {db} from "../config/db.config.js";
import {extractRequestParams, handleRadiusAttributes,} from "../config/login.config.js";
import {receiveRadiusResponse, sendRadiusRequest} from "../utils/radiusProcessing.js";

dotenv.config();

class Auth {
    async login(req, res) {
        const {username, password} = req.body
        const {clientMac, redirectUrl} = extractRequestParams(req);

        try {
            const request = {
                code: 'Access-Request',
                secret: radiusConfig.secret,
                attributes: [['User-Name', username], ['User-Password', password], ['Calling-Station-Id', clientMac]]
            };

            await sendRadiusRequest(request);
            const response = await receiveRadiusResponse();
            if (response.code !== 'Access-Accept') return handleRadiusAttributes(response, res);

            res.status(200).json({user: {username}});
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
        }
    }

    async admin(req, res) {

        const {username, password} = req.body;
        const {
            clientMac
        } = extractRequestParams(req);

        try {
            const request = {
                code: 'Access-Request',
                secret: radiusConfig.secret,
                attributes: [['User-Name', username], ['User-Password', password], ['Calling-Station-Id', clientMac]]
            };

            await sendRadiusRequest(request);
            const response = await receiveRadiusResponse();

            if (response.code !== 'Access-Accept') handleRadiusAttributes(response, res);

            const serviceTypeResult = await db.query('SELECT * FROM radcheck WHERE username = $1 AND attribute = $2 AND value = $3', [username, 'Service-Type', 'Administrative-Auth']);

            if (serviceTypeResult.rows.length === 0) {
                res.status(401).json({
                    msg: "Ошибка авторизации: вы не являетесь администратором",
                    error: "Пользователь не имеет Service-Type 'Administrative'"
                });
            }
            res.status(200).json({user: {username}});
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
        }
    }

    async refresh(req, res) {
        const acctsessionid = req.query.acctsessionid;
        try {
            const result = await db.query('UPDATE radacct SET acctsessiontime = now() WHERE acctsessionid = $1 RETURNING *', [acctsessionid]);
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
        }
    }

    async verify(req, res) {
        const {
            clientMac
        } = extractRequestParams(req);
        try {

            const macsQuery = await db.query("SELECT username FROM macs WHERE callingstationid = $1", [clientMac])
            const username = macsQuery.rows[0]?.username;
            const radcheckQuery = await db.query(`SELECT value AS servicetype 
            FROM radcheck 
            WHERE username = $1 AND attribute = 'Service-Type'`, [username]);

            if (radcheckQuery.rows.length === 0) {
                return res.status(404).json({msg: 'Пользователь не найден'});
            }

            const servicetype = radcheckQuery.rows[0].servicetype;

            const radacctQuery = await db.query(`SELECT acctsessionid, acctstarttime, acctsessiontime 
            FROM radacct 
            WHERE username = $1 AND acctstoptime IS NULL`, [username]);

            if (radacctQuery.rows.length === 0) {
                return res.status(404).json({msg: 'Сессия не найдена'});
            }

            const {acctsessionid, acctstarttime, acctsessiontime} = radacctQuery.rows[0];

            res.status(200).json({
                user: {
                    username, servicetype, acctsessionid, acctstarttime, acctsessiontime
                }
            });
        } catch (error) {
            console.log(error);
            await db.query("ROLLBACK");
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
        }
    }
}

export const auth = new Auth();