import {Request, Response} from "express";
import {db} from "../../config/db.config";
import fs from "fs";

class ActiveSessions {
    async get(req: Request, res: Response) {
        try {
            const query = await db.query(
                "SELECT acctuniqueid, username, nasipaddress, nasportid, acctstarttime, callingstationid FROM radacct WHERE acctstoptime IS NULL"
            );
            res.json(query.rows);
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
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
            res.status(500).json({ msg: 'Ошибка экспорта данных. Попробуйте позже', error });
        }
    }

}

export const activeSessions = new ActiveSessions();
