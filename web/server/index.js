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
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_config_1 = require("./config/db.config");
// Routes import
const account_1 = __importDefault(require("./routes/account"));
const data_1 = __importDefault(require("./routes/data"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.options('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.WEB_URL);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", ['X-Requested-With', 'content-type', 'credentials']);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.status(200);
    next();
});
const port = process.env.SERVER_PORT || '4000';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
app.use('/account', account_1.default);
app.use('/data', data_1.default);
db_config_1.pool.connect((err, client, release) => {
    if (err) {
        console.log(`Error connecting to PostgreSQL: ${err}`);
        return;
    }
    console.log('Connected to PostgreSQL');
    release();
    app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Server is running at ${backendUrl}`);
    }));
});
