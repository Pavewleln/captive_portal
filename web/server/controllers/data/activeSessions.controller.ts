import {Request, Response} from "express";
import {db} from "../../config/db.config";
import fs from "fs";
import {radiusConfig} from "../../config/radius.config";
import {receiveRadiusResponse, sendRadiusRequest} from "../../utils/radiusProcessing";

class ActiveSessions {
    async get(req: Request, res: Response) {
        try {
            const query = await db.query(
                "SELECT acctsessionid, username, nasipaddress, nasportid, acctstarttime, callingstationid FROM radacct WHERE acctstoptime IS NULL"
            );
            res.json(query.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка получения данных. Попробуйте позже', error});
        }
    }

    async export(req: Request, res: Response) {
        try {
            const query = await db.query(
                "SELECT * FROM radacct WHERE acctstoptime IS NULL"
            );
            fs.writeFileSync('exports/activeSessions.json', JSON.stringify(query.rows));

            res.download('exports/activeSessions.json');
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка экспорта данных. Попробуйте позже', error});
        }
    }

    async disconnect(req: Request, res: Response) {
        const acctsessionid = req.params.acctsessionid as string;
        console.log(acctsessionid);
        try {
            const request = {
                code: 'Access-Request',
                secret: radiusConfig.secret,
                attributes: [
                    ['Acct-Session-Id', acctsessionid],
                    ['Acct-Terminate-Cause', 'User-Request']
                ]
            };
            console.log(request)

            await sendRadiusRequest(request);
            const response = await receiveRadiusResponse();

            console.log(response);

            // await db.query('BEGIN');
            // await db.query('UPDATE radacct SET acctstoptime = now() WHERE acctsessionid = $1', [acctsessionid]);
            // await db.query('COMMIT');
            res.status(200);
        } catch (error) {
            await db.query('ROLLBACK');
            console.log(error);
            res.status(500).json({msg: 'Ошибка отключения пользователя. Попробуйте позже', error});
        }
    }
}

export const activeSessions = new ActiveSessions();
