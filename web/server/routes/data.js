import express from 'express';
import {activeSessions} from "../controllers/data/activeSessions.controller.js";
import {manageCredentials} from "../controllers/data/manageCredentials.controller.js";
import {viewSessions} from "../controllers/data/viewSessions.controller.js";

const router = express.Router();

router.get("/manage-credentials", manageCredentials.get);

router.post("/manage-credentials", manageCredentials.post);

router.get("/manage-credentials/export", manageCredentials.export);

router.get("/manage-credentials/:username", manageCredentials.getAllDataByUsername);

router.patch("/manage-credentials/:username", manageCredentials.patch);

router.delete("/manage-credentials/:username", manageCredentials.delete);

router.get("/active-sessions", activeSessions.get);

router.get("/active-sessions/export", activeSessions.export);

router.delete('/active-sessions/disconnect/:acctsessionid', activeSessions.disconnect);

router.get("/view-sessions", viewSessions.get);

router.get("/view-sessions/export", viewSessions.export);

export default router;