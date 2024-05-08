import express from 'express';
import {auth} from '../controllers/auth.controller.js';
import OAuthRouter from './oauth.js'
import {validateAuthData, validateAuthQueryParams} from "../validation/auth.validation.js";

const router = express.Router();
router.use('/oauth', OAuthRouter)
router.post('/login', validateAuthQueryParams, validateAuthData, auth.login);
router.post('/admin', validateAuthQueryParams, validateAuthData, auth.admin);
router.patch('/refresh/:acctsessionid', auth.refresh);
router.get('/session', auth.verify);

export default router;