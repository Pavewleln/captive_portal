import {Request, Response} from "express";
import {OAuth2Client} from "google-auth-library";
import dotenv from "dotenv";
import {log} from "../../utils/logger";
import {db} from "../../config/db.config";
import {radiusConfig} from "../../config/radius.config";
import {handleRadiusAttributes, receiveRadiusResponse, sendRadiusRequest} from "../../config/login.config";

dotenv.config();

export const OAuthGoogleRequest = async (req: Request, res: Response) => {

    // const { clientMac } = extractRequestParams(req);
    try {
        const redirectURL = `${process.env.BACKEND_URL}/account/oauth/google`;
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID!,
            process.env.CLIENT_SECRET!,
            redirectURL
        );

        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
            prompt: 'consent'
        });

        res.json({redirectUrl: authorizeUrl});
    } catch (err) {
        log.error(`Ошибка при запросе OAuth2: ${err}`);
        res.status(500).send('Internal Server Error');
    }
};
export const OAuthGoogle = async (req: Request, res: Response) => {
    const code = req.query.code as string;

    // const { clientMac } = extractRequestParams(req);
    try {
        const redirectURL = `${process.env.BACKEND_URL}/account/oauth/google`;
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID!,
            process.env.CLIENT_SECRET!,
            redirectURL
        );

        const r = await oAuth2Client.getToken(code);
        await oAuth2Client.setCredentials(r.tokens!);
        const user = oAuth2Client.credentials;

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: user.id_token as string,
            audience: process.env.CLIENT_ID
        });

        const payload = ticket.getPayload();
        const userEmail = payload?.email;

        const userRecord = await db.query('SELECT * FROM radcheck WHERE username = $1', [userEmail]);

        if (userRecord.rows.length > 0) {
            const updateUserTokensQuery = `
                UPDATE oauth_tokens 
                SET access_token = $1, refresh_token = $2, token_expiry = $3 
                WHERE user_id = $4
            `;
            await db.query(updateUserTokensQuery, [
                r.tokens.access_token,
                r.tokens.refresh_token,
                new Date(r.tokens.expiry_date as any).toISOString(),
                userRecord.rows[0].user_id
            ]);
        } else {
            const insertUserQuery = `
                INSERT INTO radcheck (username, attribute, op, value) 
                VALUES ($1, 'Cleartext-Password', ':=', $2)
            `;
            await db.query(insertUserQuery, [userEmail, payload?.sub]);
        }

        const request = {
            code: 'Access-Request',
            secret: radiusConfig.secret,
            attributes: [
                ['User-Name', userEmail],
                ['User-Password', payload?.sub],
                // ['Calling-Station-Id', clientMac]
            ]
        };

        log.info(request);

        await sendRadiusRequest(request);
        const response = await receiveRadiusResponse();

        log.info(response);

        if (response.code === 'Access-Accept') {
            res.redirect(process.env.REDIRECT_OAUTH_URL || '/index.html');
        } else {
            handleRadiusAttributes(response, res);
        }

    } catch (err) {
        log.error(`Ошибка при обработке OAuth2: ${err}`);
        res.status(500).send('Internal Server Error');
    }
};
