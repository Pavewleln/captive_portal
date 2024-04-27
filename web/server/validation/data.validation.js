"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePatchDataRequest = exports.validatePostDataRequest = void 0;
const express_validator_1 = require("express-validator");
exports.validatePostDataRequest = [
    (0, express_validator_1.body)('username').notEmpty().isString(),
    (0, express_validator_1.body)('password').notEmpty().isString(),
    (0, express_validator_1.body)('groupname').notEmpty().isString()
];
exports.validatePatchDataRequest = [
    (0, express_validator_1.body)('username').notEmpty().isString(),
    (0, express_validator_1.body)('macs').isArray(),
    (0, express_validator_1.body)('radcheck').notEmpty().isString(),
    (0, express_validator_1.body)('radusergroup').notEmpty().isString()
];
