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
exports.viewSessions = void 0;
const db_config_1 = require("../../config/db.config");
const fs_1 = __importDefault(require("fs"));
class ViewSessions {
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sqlQuery = "SELECT acctuniqueid, username, nasipaddress, nasportid, acctstarttime, acctstoptime, callingstationid FROM radacct";
                const { fromDate, toDate, username } = req.query;
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
                const query = yield db_config_1.db.query(sqlQuery);
                res.json(query.rows);
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
                let sqlQuery = "SELECT * FROM radacct";
                const { fromDate, toDate, username } = req.query;
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
                const query = yield db_config_1.db.query(sqlQuery);
                fs_1.default.writeFileSync('exports/viewSessions.json', JSON.stringify(query.rows));
                res.download('exports/viewSessions.json');
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ msg: 'Ошибка экспорта данных. Попробуйте позже', error });
            }
        });
    }
}
exports.viewSessions = new ViewSessions();
