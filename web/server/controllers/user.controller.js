"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const radius_config_1 = require("../config/radius.config");
const db_config_1 = require("../config/db.config");
const login_config_1 = require("../config/login.config");
const radiusProcessing_1 = require("../utils/radiusProcessing");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
class User {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { username, password } = req.body;
            const { clientMac, redirectUrl } = (0, login_config_1.extractRequestParams)(req);
            try {
                yield db_config_1.db.query("BEGIN");
                const request = {
                    code: radius_config_1.radiusPacketCode.ACCESS_REQUEST,
                    secret: radius_config_1.radiusConfig.secret,
                    attributes: [
                        ['User-Name', username],
                        ['User-Password', password],
                        ['Calling-Station-Id', clientMac]
                    ]
                };
                yield (0, radiusProcessing_1.sendRadiusRequest)(request);
                const response = yield (0, radiusProcessing_1.receiveRadiusResponse)();
                console.log(response);
                if (response.code !== 'Access-Accept')
                    return (0, login_config_1.handleRadiusAttributes)(response, res);
                const token = jsonwebtoken_1.default.sign({ username }, (_a = process.env.SECRET_JWT_KEY) !== null && _a !== void 0 ? _a : "SECRET_KEY", {
                    expiresIn: '24h'
                });
                const userRecord = yield db_config_1.db.query('SELECT * FROM token WHERE username = $1', [username]);
                if (userRecord.rows.length > 0) {
                    yield db_config_1.db.query(`
                UPDATE token
                SET token = $1
                WHERE username = $2
            `, [token, username]);
                }
                else {
                    yield db_config_1.db.query(`
                INSERT INTO token (username, token)
                VALUES ($1, $2)
            `, [username, token]);
                }
                yield db_config_1.db.query("COMMIT");
                res.status(200).json({ user: { username }, token });
            }
            catch (error) {
                yield db_config_1.db.query('ROLLBACK');
                console.log(error);
                res.status(500).json({ msg: 'Ошибка сервера. Попробуйте позже', error });
            }
        });
    }
    admin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { username, password } = req.body;
            const { clientMac } = (0, login_config_1.extractRequestParams)(req);
            try {
                const request = {
                    code: radius_config_1.radiusPacketCode.ACCESS_REQUEST,
                    secret: radius_config_1.radiusConfig.secret,
                    attributes: [
                        ['User-Name', username],
                        ['User-Password', password],
                        ['Calling-Station-Id', clientMac]
                    ]
                };
                yield (0, radiusProcessing_1.sendRadiusRequest)(request);
                const response = yield (0, radiusProcessing_1.receiveRadiusResponse)();
                if (response.code !== 'Access-Accept')
                    (0, login_config_1.handleRadiusAttributes)(response, res);
                const serviceTypeResult = yield db_config_1.db.query('SELECT * FROM radcheck WHERE username = $1 AND attribute = $2 AND value = $3', [username, 'Service-Type', 'Administrative-User']);
                if (serviceTypeResult.rows.length === 0) {
                    res.status(401).json({
                        msg: "Ошибка авторизации: вы не являетесь администратором",
                        error: "Пользователь не имеет Service-Type 'Administrative'"
                    });
                }
                const token = jsonwebtoken_1.default.sign({ username }, (_a = process.env.SECRET_JWT_KEY) !== null && _a !== void 0 ? _a : "SECRET_KEY", {
                    expiresIn: '24h'
                });
                const userRecord = yield db_config_1.db.query('SELECT * FROM token WHERE username = $1', [username]);
                if (userRecord.rows.length > 0) {
                    yield db_config_1.db.query(`
                UPDATE token
                SET token = $1
                WHERE username = $2
            `, [token, username]);
                }
                else {
                    yield db_config_1.db.query(`
                INSERT INTO token (username, token)
                VALUES ($1, $2)
            `, [username, token]);
                }
                yield db_config_1.db.query("COMMIT");
                res.status(200).json({ user: { username }, token });
            }
            catch (error) {
                yield db_config_1.db.query('ROLLBACK');
                console.log(error);
                res.status(500).json({ msg: 'Ошибка сервера. Попробуйте позже', error });
            }
        });
    }
    refresh(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const acctsessionid = req.query.acctsessionid;
            try {
                const result = yield db_config_1.db.query('UPDATE radacct SET acctsessiontime = now() WHERE acctsessionid = $1 RETURNING *', [acctsessionid]);
                res.status(200).json(result.rows[0]);
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ msg: 'Ошибка сервера. Попробуйте позже', error });
            }
        });
    }
    verify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = req.username;
            try {
                // Запрос к таблице radcheck
                const radcheckQuery = yield db_config_1.db.query(`SELECT value AS servicetype 
            FROM radcheck 
            WHERE username = $1 AND attribute = 'Service-Type'`, [username]);
                // Проверяем, есть ли запись в таблице radcheck
                if (radcheckQuery.rows.length === 0) {
                    return res.status(404).json({ msg: 'Пользователь не найден' });
                }
                const servicetype = radcheckQuery.rows[0].servicetype;
                // Запрос к таблице radacct
                const radacctQuery = yield db_config_1.db.query(`SELECT acctsessionid, acctstarttime, acctsessiontime 
            FROM radacct 
            WHERE username = $1 AND acctstoptime IS NULL`, [username]);
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
            }
            catch (error) {
                console.log(error);
                yield db_config_1.db.query("ROLLBACK");
                res.status(500).json({ msg: 'Ошибка сервера. Попробуйте позже', error });
            }
        });
    }
}
exports.user = new User();
