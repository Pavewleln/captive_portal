import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
    username: string;
}

declare module 'express' {
    interface Request {
        username?: string;
    }
}

export default (req: Request, res: Response, next: NextFunction) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY || "") as DecodedToken;
            req.username = decoded.username;
            next();
        } catch (error) {
            return res.status(403).json({
                message: "Нет доступа",
                error
            });
        }
    } else {
        return res.status(403).json({
            message: "Нет доступа"
        });
    }
};
