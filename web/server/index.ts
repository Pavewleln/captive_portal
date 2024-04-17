import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
// Routes import
import AuthRoute from './routes/account';
import DataRoute from './routes/data';
import {swaggerDocs} from "./utils/swagger";
import {log} from "./utils/logger";
import { pool } from './config/db.config';
import session from "express-session";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(cookieParser());

app.options('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.WEB_URL);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", ['X-Requested-With', 'content-type', 'credentials']);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.status(200);
    next()
})

const port = process.env.SERVER_PORT || '4000';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'
app.use('/account', AuthRoute);
app.use('/data', DataRoute);

pool.connect((err, client, release) => {
    if (err) {
        log.error(`Error connecting to PostgreSQL: ${err}`);
        return;
    }
    log.info('Connected to PostgreSQL');
    release();
    app.listen(port, async () => {
        log.info(`Server is running at ${backendUrl}`);
        swaggerDocs(app, backendUrl);
    });
});