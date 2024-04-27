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
exports.OauthGoogle = exports.OAuthGoogleRequest = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_1 = require("../../config/db.config");
const radius_config_1 = require("../../config/radius.config");
const radiusProcessing_1 = require("../../utils/radiusProcessing");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const getUserEmail = (sub, oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Получаем информацию о пользователе из Google People API
        const people = googleapis_1.google.people({
            version: 'v1',
            auth: oAuth2Client
        });
        const res = yield people.people.get({
            resourceName: 'people/' + sub,
            personFields: 'emailAddresses'
        });
        // @ts-ignore
        const userEmail = (_a = res.data.emailAddresses.find((email) => email.metadata.primary)) === null || _a === void 0 ? void 0 : _a.value;
        return userEmail || null;
    }
    catch (error) {
        console.error('Ошибка получения адреса электронной почты пользователя:', error);
        return null;
    }
});
const OAuthGoogleRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redirectURL = `${process.env.BACKEND_URL}/account/oauth/google`;
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, redirectURL);
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
            prompt: 'consent'
        });
        res.json({ redirectUrl: authorizeUrl });
    }
    catch (err) {
        console.log(`Ошибка при запросе OAuth2: ${err}`);
        res.status(500).send('Internal Server Error');
    }
});
exports.OAuthGoogleRequest = OAuthGoogleRequest;
const OauthGoogle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const code = req.query.code;
    try {
        const redirectURL = `${process.env.BACKEND_URL}/account/oauth/google`;
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, redirectURL);
        const r = yield oAuth2Client.getToken(code);
        yield oAuth2Client.setCredentials(r.tokens);
        const user = oAuth2Client.credentials;
        const ticket = yield oAuth2Client.verifyIdToken({
            idToken: user.id_token,
            audience: process.env.CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload)
            res.redirect(process.env.WEB_URL + "login");
        const userEmail = yield getUserEmail(payload.sub, oAuth2Client);
        if (!userEmail)
            res.redirect(process.env.WEB_URL + "login");
        console.log(userEmail);
        const userRecord = yield db_config_1.db.query('SELECT * FROM token WHERE username = $1', [userEmail]);
        const token = jsonwebtoken_1.default.sign({ userEmail }, (_b = process.env.SECRET_JWT_KEY) !== null && _b !== void 0 ? _b : "SECRET_KEY", {
            expiresIn: '24h'
        });
        if (userRecord.rows.length > 0) {
            // Если пользователь существует, обновляем его токен
            yield db_config_1.db.query(`
                UPDATE token
                SET token = $1
                WHERE username = $2
            `, [token, userEmail]);
        }
        else {
            yield db_config_1.db.query(`
                INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, 'Cleartext-Password', ':=', $2),
                                        ($1, 'Service-Type', ':=', 'Login-User'),
                                        ($1, 'Session-Timeout', ':=', 3600)
            `, [userEmail, payload.sub]);
            yield db_config_1.db.query(`
                INSERT INTO token (username, token)
                VALUES ($1, $2)
            `, [userEmail, token]);
        }
        const request = {
            code: 'Access-Request',
            secret: radius_config_1.radiusConfig.secret,
            attributes: [
                ['User-Name', userEmail],
                ['User-Password', payload.sub]
            ]
        };
        yield (0, radiusProcessing_1.sendRadiusRequest)(request);
        const response = yield (0, radiusProcessing_1.receiveRadiusResponse)();
        yield db_config_1.db.query("COMMIT");
        if (response.code !== 'Access-Accept')
            res.redirect(process.env.WEB_URL + "login");
        res.cookie("access_token", token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        res.redirect((_c = process.env.WEB_URL) !== null && _c !== void 0 ? _c : "");
    }
    catch (err) {
        yield db_config_1.db.query("ROLLBACK");
        console.log(`Error handling OAuth2: ${err}`);
        res.status(500).send('Internal Server Error');
    }
});
exports.OauthGoogle = OauthGoogle;
