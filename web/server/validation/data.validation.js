import {body} from "express-validator";

export const validatePostDataRequest = [
    body('username').notEmpty().isString(),
    body('password').notEmpty().isString(),
    body('groupname').notEmpty().isString()
];

export const validatePatchDataRequest = [
    body('username').notEmpty().isString(),
    body('macs').isArray(),
    body('radcheck').notEmpty().isString(),
    body('radusergroup').notEmpty().isString()
];