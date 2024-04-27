"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const oauth_google_controller_1 = require("../controllers/oauth/oauth.google.controller");
const router = express_1.default.Router();
router.get('/google', oauth_google_controller_1.OauthGoogle);
router.post('/google/request', oauth_google_controller_1.OAuthGoogleRequest);
exports.default = router;
