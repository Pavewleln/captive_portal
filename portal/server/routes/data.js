import express from 'express';
import {activeSessions} from "../controllers/data/activeSessions.controller.js";
import {users} from "../controllers/data/users.controller.js";
import {allSessions} from "../controllers/data/allSessions.controller.js";
import {events} from "../controllers/data/events.controller.js";

const router = express.Router();

router.get("/users", users.get);

router.post("/users", users.post);

router.get("/users/export", users.export);

router.get("/users/:username", users.getAllDataByUsername);

router.patch("/users", users.patch);

router.delete("/users/:username", users.delete);

router.get("/active-sessions", activeSessions.get);

router.get("/active-sessions/export", activeSessions.export);

router.get("/all-sessions", allSessions.get);

router.get("/all-sessions/export", allSessions.export);

router.get("/events", events.get);
router.get("/events/export", events.export);
export default router;