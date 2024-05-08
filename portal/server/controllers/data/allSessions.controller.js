import {db} from "../../config/db.config.js";
import fs from "fs";

class AllSessions {
    async get(req, res) {
        try {
            let sqlQuery = "SELECT acctuniqueid, username, nasipaddress, nasportid, acctstarttime, acctstoptime, callingstationid FROM radacct";

            const {fromDate, toDate, username} = req.query;

            const filters = [];

            if (fromDate) {
                filters.push(`acctstarttime >= '${fromDate}'`);
            }
            if (toDate) {
                filters.push(`acctstoptime <= '${toDate}'`);
            }
            if (username) {
                filters.push(`username LIKE '%${username}%'`);
            }

            if (filters.length > 0) {
                sqlQuery += ` WHERE ${filters.join(' AND ')}`;
            }
            const query = await db.query(sqlQuery);
            res.json(query.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка получения данных. Попробуйте позже', error});
        }
    }

    async export(req, res) {
        try {
            let sqlQuery = "SELECT * FROM radacct";

            const {fromDate, toDate, username} = req.query;

            const filters = [];

            if (fromDate) {
                filters.push(`acctstarttime >= '${fromDate}'`);
            }
            if (toDate) {
                filters.push(`acctstoptime <= '${toDate}'`);
            }
            if (username) {
                filters.push(`username LIKE '%${username}%'`);
            }

            if (filters.length > 0) {
                sqlQuery += ` WHERE ${filters.join(' AND ')}`;
            }
            const query = await db.query(sqlQuery);
            fs.writeFileSync('exports/viewSessions.json', JSON.stringify(query.rows));

            res.download('exports/viewSessions.json');
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка экспорта данных. Попробуйте позже', error});
        }
    }
}

export const allSessions = new AllSessions();
