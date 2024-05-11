import dotenv from 'dotenv';
import {db} from "../config/db.config.js";

dotenv.config();

class Auth {
    async admin(req, res) {

        const {username, password} = req.body;
        try {
            const serviceTypeResult = await db.query('SELECT * FROM radcheck WHERE username = $1 AND attribute = $2 AND value = $3', [username, 'Service-Type', 'Administrative-User']);

            if (serviceTypeResult.rows.length <= 0) {
                res.status(401).json({
                    msg: "Ошибка авторизации: вы не являетесь администратором",
                    error: "Пользователь не имеет Service-Type 'Administrative-User'"
                });
                return;
            }
            res.status(200).json({user: {username, password}});
        } catch (error) {
            console.log(error);
            res.status(500).json({msg: 'Ошибка сервера. Попробуйте позже', error});
        }
    }
}

export const auth = new Auth();