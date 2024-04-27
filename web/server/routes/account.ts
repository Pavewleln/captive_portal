import express from 'express';
import {user} from '../controllers/user.controller';
import OAuthRouter from '../routes/oauth'
import {validateAuthData, validateAuthQueryParams} from "../validation/auth.validation";
import isAuth from "../utils/isAuth";

const router = express.Router();
router.use('/oauth', OAuthRouter)
router.post('/login', validateAuthQueryParams, validateAuthData, user.login);
router.post('/admin', validateAuthQueryParams, validateAuthData, user.admin);
router.patch('/refresh/:acctsessionid', user.refresh);
router.get('/session', isAuth, user.verify);

export default router;