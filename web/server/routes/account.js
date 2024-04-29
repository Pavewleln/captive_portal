import express from 'express';
import {user} from '../controllers/user.controller.js';
import OAuthRouter from './oauth.js'
import {validateAuthData, validateAuthQueryParams} from "../validation/auth.validation.js";

const router = express.Router();
router.use('/oauth', OAuthRouter)
router.post('/login', validateAuthQueryParams, validateAuthData, user.login);
router.post('/admin', validateAuthQueryParams, validateAuthData, user.admin);
router.patch('/refresh/:acctsessionid', user.refresh);
router.get('/session', user.verify);

export default router;