import express from 'express';
import {OauthGoogle, OAuthGoogleRequest} from "../controllers/oauth/oauth.google.controller";

const router = express.Router();

router.get('/google', OauthGoogle)
router.post('/google/request', OAuthGoogleRequest);

export default router;