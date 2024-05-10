import {OAuth2Client} from "google-auth-library";
import dotenv from "dotenv";
import {db} from "../../config/db.config.js";
import {extractRequestParams} from "../../config/login.config.js";

dotenv.config();

export const OAuthGoogleRequest = async (req, res) => {
    const {clientMac} = extractRequestParams(req);
    try {
        const redirectURL = `${process.env.BACKEND_URL}/account/oauth/google`;
        const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, redirectURL);

        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
            prompt: 'consent',
            state: JSON.stringify({mac: `${clientMac}`})
        });

        res.json({redirectUrl: authorizeUrl});
    } catch (err) {
        console.log(`Ошибка при запросе OAuth2: ${err}`);
        res.status(500).send('Internal Server Error');
    }
};
export const OauthGoogle = async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    try {
        const {mac} = JSON.parse(state);
        const redirectURL = `${process.env.BACKEND_URL}/account/oauth/google`;

        const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, redirectURL);

        const r = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(r.tokens);
        const user = oAuth2Client.credentials;

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: user.id_token, audience: process.env.CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) res.redirect(process.env.WEB_URL + "login");

        const {email} = await oAuth2Client.getTokenInfo(r.tokens.access_token);
        const userRecord = await db.query('SELECT * FROM token WHERE username = \$1', [email]);

        if (userRecord.rows.length <= 0) {
            await db.query("BEGIN");
            await db.query(`
                INSERT INTO radcheck (username, attribute, op, value) VALUES (\$1, 'Cleartext-Password', ':=', \$2),
                                        (\$1, 'Service-Type', ':=', 'Login-User'),
                                        (\$1, 'Session-Timeout', ':=', 3600)
            `, [email, payload.sub]);
            await db.query(`INSERT INTO macs (username, callingstationid) VALUES (\$1, \$2)`, [email, mac]);
            await db.query("COMMIT");
        }

        res.cookie('username', email, { httpOnly: true });
        res.cookie('password', payload.sub, { httpOnly: true });

        res.redirect(process.env.WEB_URL ?? "");
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(`Error handling OAuth2: ${err}`);
        res.status(500).send('Internal Server Error');
    }
};

