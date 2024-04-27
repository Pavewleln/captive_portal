import {Request, Response} from "express";
import {OAuth2Client, TokenPayload} from "google-auth-library";
import {google} from "googleapis";
import dotenv from "dotenv";
import {db} from "../../config/db.config";
import {radiusConfig} from "../../config/radius.config";
import {receiveRadiusResponse, sendRadiusRequest} from "../../utils/radiusProcessing";
import jwt from "jsonwebtoken";

dotenv.config();

const getUserEmail = async (sub: string, oAuth2Client: OAuth2Client): Promise<string | null> => {
    try {
        // Получаем информацию о пользователе из Google People API
        const people = google.people({
            version: 'v1',
            auth: oAuth2Client
        });

        const res = await people.people.get({
            resourceName: 'people/' + sub,
            personFields: 'emailAddresses'
        });

        // @ts-ignore
        const userEmail = res.data.emailAddresses.find((email: string) => email.metadata.primary)?.value;
        return userEmail || null;
    } catch (error) {
        console.error('Ошибка получения адреса электронной почты пользователя:', error);
        return null;
    }
}

export const OAuthGoogleRequest = async (req: Request, res: Response) => {
    try {
        const redirectURL = `${process.env.BACKEND_URL}/account/oauth/google`;
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID!,
            process.env.CLIENT_SECRET!,
            redirectURL
        );

        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
            prompt: 'consent'
        });

        res.json({redirectUrl: authorizeUrl});
    } catch (err) {
        console.log(`Ошибка при запросе OAuth2: ${err}`);
        res.status(500).send('Internal Server Error');
    }
};
export const OauthGoogle = async (req: Request, res: Response) => {
    const code = req.query.code as string;
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

        const payload = ticket.getPayload() as TokenPayload;
        if (!payload) res.redirect(process.env.WEB_URL + "login");

        const userEmail = await getUserEmail(payload.sub, oAuth2Client);
        if (!userEmail) res.redirect(process.env.WEB_URL + "login");

        console.log(userEmail)

        const userRecord = await db.query('SELECT * FROM token WHERE username = $1', [userEmail]);

        const token = jwt.sign({userEmail}, process.env.SECRET_JWT_KEY ?? "SECRET_KEY", {
            expiresIn: '24h'
        });

        if (userRecord.rows.length > 0) {
            // Если пользователь существует, обновляем его токен
            await db.query(`
                UPDATE token
                SET token = $1
                WHERE username = $2
            `,
                [token, userEmail]
            );
        } else {
            await db.query(`
                INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, 'Cleartext-Password', ':=', $2),
                                        ($1, 'Service-Type', ':=', 'Login-User'),
                                        ($1, 'Session-Timeout', ':=', 3600)
            `, [userEmail, payload.sub]);

            await db.query(`
                INSERT INTO token (username, token)
                VALUES ($1, $2)
            `,
                [userEmail, token]
            );
        }

        const request = {
            code: 'Access-Request',
            secret: radiusConfig.secret,
            attributes: [
                ['User-Name', userEmail],
                ['User-Password', payload.sub]
            ]
        };

        await sendRadiusRequest(request);
        const response = await receiveRadiusResponse();

        await db.query("COMMIT");

        if (response.code !== 'Access-Accept') res.redirect(process.env.WEB_URL + "login");

        res.cookie("access_token", token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        res.redirect(process.env.WEB_URL ?? "");
    } catch (err) {
        await db.query("ROLLBACK");
        console.log(`Error handling OAuth2: ${err}`);
        res.status(500).send('Internal Server Error');
    }
};

