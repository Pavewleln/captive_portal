import express from 'express';
import {auth} from '../controllers/auth.controller.js';
import OAuthRouter from './oauth.js'

const router = express.Router();
router.use('/oauth', OAuthRouter)
router.post('/admin', auth.admin);

export default router;