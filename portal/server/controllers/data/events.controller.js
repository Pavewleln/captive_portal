import {db} from "../../config/db.config.js";
import fs from "fs";

class Events {
    async get(req, res) {
        try {
            const query = await db.query(`
            SELECT
                username,
                pass AS password,
                reply,
                authdate
            FROM radpostauth;
        `);

            res.status(200).json(query.rows);
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка получения данных. Попробуйте позже', error});
        }
    }
    async export(req, res) {
        try {
            const query = await db.query(`
            SELECT
                username,
                pass AS password,
                reply,
                authdate
            FROM radpostauth;
        `);
            fs.writeFileSync('exports/events.json', JSON.stringify(query.rows));

            res.download('exports/events.json');
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка экспорта данных. Попробуйте позже', error});
        }
    }
}

export const events = new Events();