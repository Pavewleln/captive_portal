import {NextFunction, Request, Response} from 'express';

const queryParamsToValidate = [
    'client-ip',
    'client-mac',
    'ap-ip',
    'ap-mac',
    // 'ac-ip',
    // 'ac-mac',
    // 'ssid',
    // 'accept-callback',
    'redirect-url'
];

type ValidateLoginQueryParamsMiddleware = (req: Request, res: Response, next: NextFunction) => void;
type ValidateLoginDataMiddleware = (req: Request, res: Response, next: NextFunction) => void;

export const validateAuthQueryParams: ValidateLoginQueryParamsMiddleware = (req, res, next) => {
    const errors: string[] = queryParamsToValidate.filter(param => req.query[param] === '' || req.query[param] === 'null' || req.query[param] === 'undefined' || req.query[param] === '-');

    if (errors.length > 0) {
        const errorMessages = errors.map(param => `Некорректное значение параметра ${param}`).join('. ');
        return res.status(400).json({
            msg: "Данная ссылка повреждена. Пожалуйста, попробуйте авторизоваться позже",
            error: errorMessages
        });
    }

    next();
};

export const validateAuthData: ValidateLoginDataMiddleware = (req, res, next) => {
    const {username, password} = req.body;

    if (!username || typeof username !== 'string' || !validateUsername(username)) {
        return res.status(400).json({
            msg: 'Введите корректное имя пользователя (номер телефона или электронная почта)',
            error: 'Некорректное имя пользователя'
        });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
            msg: 'Введите корректный пароль (не менее 8 символов)',
            error: 'Слишком короткий пароль'
        });
    }

    next();
};

function validateUsername(username: string): boolean {
    const phoneRegex = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return phoneRegex.test(username) || emailRegex.test(username);
}
