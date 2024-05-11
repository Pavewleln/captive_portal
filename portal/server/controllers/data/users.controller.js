import {db} from "../../config/db.config.js";
import * as fs from "fs";

class Users {
    async get(req, res) {
        try {
            const query = await db.query(`
            SELECT
                username,
                value AS password
            FROM radcheck 
            WHERE
                attribute = 'Cleartext-Password';
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
                username AS "username",
                value AS "password"
            FROM radcheck
            WHERE
                attribute = 'Cleartext-Password';
        `);

            const userData = [];
            for (const row of query.rows) {

                const {rows: radcheckRows} = await db.query(`
                SELECT attribute, value
                FROM radcheck
                WHERE username = $1
            `, [row.username]);

                const {rows: macRows} = await db.query(`
                SELECT callingstationid AS MAC
                FROM macs
                WHERE username = $1
            `, [row.username]);

                const user = {
                    ...radcheckRows.reduce((acc, row) => {
                        acc[row.attribute] = row.value;
                        return acc;
                    }, {}), MAC: macRows.length > 0 ? macRows[0].mac : '-', username: row.username
                };

                userData.push(user);
            }
            fs.writeFileSync('exports/users.json', JSON.stringify(userData));

            res.download('exports/users.json');
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка экспорта данных. Попробуйте позже', error});
        }
    }

    async getAllDataByUsername(req, res) {
        try {
            const username = req.params.username;

            const {rows: radcheckRows} = await db.query(`
            SELECT attribute, value
            FROM radcheck
            WHERE username = $1
        `, [username]);

            const {rows: macRows} = await db.query(`
            SELECT callingstationid AS MAC
            FROM macs
            WHERE username = $1
        `, [username]);

            const data = {
                ...radcheckRows.reduce((acc, row) => {
                    acc[row.attribute] = row.value;
                    return acc;
                }, {}), MAC: macRows.length > 0 ? macRows[0].mac : '-',
            }
            res.status(200).json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка получения данных. Попробуйте позже', error});
        }
    }

    async post(req, res) {
        try {
            const {
                username, password, mac = '-', role,
            } = req.body;
            await db.query('BEGIN');

            const existingAttribute = await db.query('SELECT * FROM radcheck WHERE username = $1', [username]);
            if (existingAttribute.rows.length > 0) {
                return res.status(400).json({
                    msg: `Пользователь ${username} уже существует`, error: `Пользователь ${username} уже существует`
                });
            }

            await db.query(`INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, $2, $3, $4)`, [username, 'Cleartext-Password', ':=', password]);
            await db.query(`INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, $2, $3, $4)`, [username, 'Service-Type', ':=', role]);

            await db.query('INSERT INTO macs (username, callingstationid) VALUES ($1, $2)', [username, mac || "-"]);

            await db.query('COMMIT');
            res.status(201).json({username, password});
        } catch (error) {
            console.log(error);
            await db.query('ROLLBACK');
            res.status(500).json({msg: 'Ошибка записи. Попробуйте позже', error});
        }
    }

    async patch(req, res) {
        try {
            const {
                oldUsername, newUsername, macs, radcheck
            } = req.body;
            await db.query('BEGIN');

            await db.query('DELETE FROM radcheck WHERE username = $1', [oldUsername]);
            await db.query('DELETE FROM macs WHERE username = $1', [oldUsername]);

            for (const key of Object.keys(radcheck)) {
                const value = radcheck[key];
                const [attribute] = key.split('_');
                await db.query('INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, $2, $3, $4)', [newUsername, attribute, ':=', value]);
            }

            for (const key of Object.keys(macs)) {
                const callingstationid = macs[key];
                await db.query('INSERT INTO macs (username, callingstationid) VALUES ($1, $2)', [newUsername, callingstationid]);
            }

            await db.query('COMMIT');
            res.status(200).json({msg: "Успешно изменено"});
        } catch (error) {
            await db.query('ROLLBACK');
            console.log(error);
            res.status(500).json({msg: 'Ошибка изменения данных. Попробуйте позже', error});
        }
    }


    async delete(req, res) {
        const username = req.params.username;
        try {
            await db.query('BEGIN');

            await db.query('DELETE FROM radcheck WHERE username = $1', [username]);
            await db.query('DELETE FROM macs WHERE username = $1', [username]);

            await db.query('COMMIT');
            res.status(200).json({msg: "Успешно удалено"});
        } catch (error) {
            await db.query('ROLLBACK');
            console.log(error);
            res.status(500).json({msg: 'Ошибка удаления записей. Попробуйте позже', error});
        }
    }
}

export const users = new Users();
