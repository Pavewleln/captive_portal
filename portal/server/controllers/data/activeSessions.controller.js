import {db} from "../../config/db.config.js";
import fs from "fs";

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
            res.status(200).json({msg: "Пользователь успешно отключен"});
        } catch (error) {
            await db.query('ROLLBACK');
            console.log(error);
            res.status(500).json({msg: 'Ошибка отключения пользователя. Попробуйте позже', error});
        }
    }
}

export const activeSessions = new ActiveSessions();
