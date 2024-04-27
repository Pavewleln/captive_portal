"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const oauth_1 = __importDefault(require("../routes/oauth"));
const auth_validation_1 = require("../validation/auth.validation");
const isAuth_1 = __importDefault(require("../utils/isAuth"));
const router = express_1.default.Router();
router.use('/oauth', oauth_1.default);
router.post('/login', auth_validation_1.validateAuthQueryParams, auth_validation_1.validateAuthData, user_controller_1.user.login);
router.post('/admin', auth_validation_1.validateAuthQueryParams, auth_validation_1.validateAuthData, user_controller_1.user.admin);
router.patch('/refresh/:acctsessionid', user_controller_1.user.refresh);
router.get('/session', isAuth_1.default, user_controller_1.user.verify);
exports.default = router;
