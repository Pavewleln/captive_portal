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
exports.activeSessions = void 0;
const db_config_1 = require("../../config/db.config");
const fs_1 = __importDefault(require("fs"));
const radius_config_1 = require("../../config/radius.config");
const radiusProcessing_1 = require("../../utils/radiusProcessing");
class ActiveSessions {
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = yield db_config_1.db.query("SELECT acctsessionid, username, nasipaddress, nasportid, acctstarttime, callingstationid FROM radacct WHERE acctstoptime IS NULL");
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
                const query = yield db_config_1.db.query("SELECT * FROM radacct WHERE acctstoptime IS NULL");
                fs_1.default.writeFileSync('exports/activeSessions.json', JSON.stringify(query.rows));
                res.download('exports/activeSessions.json');
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ msg: 'Ошибка экспорта данных. Попробуйте позже', error });
            }
        });
    }
    disconnect(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const acctsessionid = req.params.acctsessionid;
            console.log(acctsessionid);
            try {
                const request = {
                    code: 'Access-Request',
                    secret: radius_config_1.radiusConfig.secret,
                    attributes: [
                        ['Acct-Session-Id', acctsessionid],
                        ['Acct-Terminate-Cause', 'User-Request']
                    ]
                };
                console.log(request);
                yield (0, radiusProcessing_1.sendRadiusRequest)(request);
                const response = yield (0, radiusProcessing_1.receiveRadiusResponse)();
                console.log(response);
                // await db.query('BEGIN');
                // await db.query('UPDATE radacct SET acctstoptime = now() WHERE acctsessionid = $1', [acctsessionid]);
                // await db.query('COMMIT');
                res.status(200);
            }
            catch (error) {
                yield db_config_1.db.query('ROLLBACK');
                console.log(error);
                res.status(500).json({ msg: 'Ошибка отключения пользователя. Попробуйте позже', error });
            }
        });
    }
}
exports.activeSessions = new ActiveSessions();
