"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageCredentials = void 0;
const db_config_1 = require("../../config/db.config");
const fs = __importStar(require("fs"));
class ManageCredentials {
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = yield db_config_1.db.query(`
            SELECT
                username,
                value AS password
            FROM radcheck 
            WHERE
                attribute = 'Cleartext-Password';
        `);
                res.status(200).json(query.rows);
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ msg: 'Ошибка получения данных. Попробуйте позже', error });
            }
        });
    }
    export(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = yield db_config_1.db.query(`
            SELECT
                username AS "username",
                value AS "password"
            FROM radcheck
            WHERE
                attribute = 'Cleartext-Password';
        `);
                const userData = [];
                for (const row of query.rows) {
                    const { rows: radcheckRows } = yield db_config_1.db.query(`
                SELECT attribute, value
                FROM radcheck
                WHERE username = $1
            `, [row.username]);
                    const { rows: macRows } = yield db_config_1.db.query(`
                SELECT callingstationid AS MAC
                FROM macs
                WHERE username = $1
            `, [row.username]);
                    const user = Object.assign(Object.assign({}, radcheckRows.reduce((acc, row) => {
                        acc[row.attribute] = row.value;
                        return acc;
                    }, {})), { MAC: macRows.length > 0 ? macRows[0].mac : '-', username: row.username });
                    userData.push(user);
                }
                fs.writeFileSync('exports/credentials.json', JSON.stringify(userData));
                res.download('exports/credentials.json');
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ msg: 'Ошибка экспорта данных. Попробуйте позже', error });
            }
        });
    }
    getAllDataByUsername(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const username = req.params.username;
                const { rows: radcheckRows } = yield db_config_1.db.query(`
            SELECT attribute, value
            FROM radcheck
            WHERE username = $1
        `, [username]);
                const { rows: macRows } = yield db_config_1.db.query(`
            SELECT callingstationid AS MAC
            FROM macs
            WHERE username = $1
        `, [username]);
                const data = Object.assign(Object.assign({}, radcheckRows.reduce((acc, row) => {
                    acc[row.attribute] = row.value;
                    return acc;
                }, {})), { MAC: macRows.length > 0 ? macRows[0].mac : '-' });
                res.status(200).json(data);
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ msg: 'Ошибка получения данных. Попробуйте позже', error });
            }
        });
    }
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password, mac = '-', role, } = req.body;
                yield db_config_1.db.query('BEGIN');
                const existingAttribute = yield db_config_1.db.query('SELECT * FROM radcheck WHERE username = $1', [username]);
                if (existingAttribute.rows.length > 0) {
                    yield db_config_1.db.query('ROLLBACK');
                    return res.status(400).json({
                        msg: `Пользователь ${username} уже существует`,
                        error: `Пользователь ${username} уже существует`
                    });
                }
                const newUser = yield db_config_1.db.query('INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, $2, $3, $4) RETURNING username, value as password', [username, 'Cleartext-Password', ':=', password]);
                yield db_config_1.db.query('INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, $2, $3, $4)', [username, 'Service-Type', ':=', role]);
                yield db_config_1.db.query('INSERT INTO macs (username, callingstationid) VALUES ($1, $2)', [username, mac]);
                yield db_config_1.db.query('COMMIT');
                res.status(201).json(newUser.rows[0]);
            }
            catch (error) {
                console.log(error);
                yield db_config_1.db.query('ROLLBACK');
                res.status(500).json({ msg: 'Ошибка записи. Попробуйте позже', error });
            }
        });
    }
    patch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const oldUsername = req.params.username;
                const { username, macs, radcheck } = req.body;
                yield db_config_1.db.query('BEGIN');
                yield db_config_1.db.query('DELETE FROM radcheck WHERE username = $1', [oldUsername]);
                yield db_config_1.db.query('DELETE FROM macs WHERE username = $1', [oldUsername]);
                for (const key of Object.keys(radcheck)) {
                    const value = radcheck[key];
                    const [attribute] = key.split('_');
                    yield db_config_1.db.query('INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, $2, $3, $4)', [username, attribute, ':=', value]);
                }
                for (const key of Object.keys(macs)) {
                    const callingstationid = macs[key];
                    yield db_config_1.db.query('INSERT INTO macs (username, callingstationid) VALUES ($1, $2)', [username, callingstationid]);
                }
                yield db_config_1.db.query('COMMIT');
                res.status(200);
            }
            catch (error) {
                yield db_config_1.db.query('ROLLBACK');
                console.log(error);
                res.status(500).json({ msg: 'Ошибка изменения данных. Попробуйте позже', error });
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = req.params.username;
            try {
                yield db_config_1.db.query('BEGIN');
                yield db_config_1.db.query('DELETE FROM radcheck WHERE username = $1', [username]);
                yield db_config_1.db.query('DELETE FROM macs WHERE username = $1', [username]);
                yield db_config_1.db.query('COMMIT');
                res.status(200);
            }
            catch (error) {
                yield db_config_1.db.query('ROLLBACK');
                console.log(error);
                res.status(500).json({ msg: 'Ошибка удаления записей. Попробуйте позже', error });
            }
        });
    }
}
exports.manageCredentials = new ManageCredentials();
