import {db} from "../../config/db.config.js";
import fs from "fs";
import {radiusConfig} from "../../config/radius.config.js";
import {receiveRadiusResponse, sendRadiusRequest} from "../../utils/radiusProcessing.js";
import {handleRadiusAttributes} from "../../config/login.config.js";

class ActiveSessions {
    async get(req, res) {
        try {
            const query = await db.query("SELECT acctsessionid, username, nasipaddress, nasportid, acctstarttime, callingstationid FROM radacct WHERE acctstoptime IS NULL");
            res.json(query.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка получения данных. Попробуйте позже', error});
        }
    }

    async export(req, res) {
        try {
            const query = await db.query("SELECT * FROM radacct WHERE acctstoptime IS NULL");
            fs.writeFileSync('exports/activeSessions.json', JSON.stringify(query.rows));

            res.download('exports/activeSessions.json');
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка экспорта данных. Попробуйте позже', error});
        }
    }

    async disconnect(req, res) {
        const acctsessionid = req.params.acctsessionid;
        console.log(acctsessionid);
        try {
            const request = {
                code: 'Access-Request',
                secret: radiusConfig.secret,
                attributes: [['Acct-Session-Id', acctsessionid], ['Acct-Terminate-Cause', 'User-Request']]
            };

            await sendRadiusRequest(request);
            const response = await receiveRadiusResponse();

            if (response.code !== 'Access-Accept') handleRadiusAttributes(response, res);

            // await db.query('BEGIN');
            // await db.query('UPDATE radacct SET acctstoptime = now() WHERE acctsessionid = $1', [acctsessionid]);
            // await db.query('COMMIT');
            res.status(200).json({msg: "Пользователь успешно отключен"});
        } catch (error) {
            await db.query('ROLLBACK');
            console.log(error);
            res.status(500).json({msg: 'Ошибка отключения пользователя. Попробуйте позже', error});
        }
    }
}

export const activeSessions = new ActiveSessions();
