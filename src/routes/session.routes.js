import express from "express";
import { csrfProtection } from "../middlewares/csrf.js";
import { loginLimiter } from "../middlewares/rateLimit.js";
import { requireSession, requireRoleSession } from "../middlewares/auth.js";
import { loginSession, registerSession, logoutSession, meSession } from "../controllers/auth.controller.js";
import { listLogs } from "../controllers/admin.controller.js";

export const sessionRouter = express.Router();

sessionRouter.use(csrfProtection);

// CSRF token
sessionRouter.get("/csrf-token", (req, res)=> res.json({ csrfToken: req.csrfToken() }));

// Auth (session)
sessionRouter.post("/auth/login", loginLimiter, loginSession);
sessionRouter.post("/auth/register", registerSession);
sessionRouter.post("/auth/logout", logoutSession);

// Session info
sessionRouter.get("/me", requireSession, meSession);
sessionRouter.get("/admin", requireSession, requireRoleSession("admin"), (req,res)=> res.json({ ok:true, admin:true }));
sessionRouter.get("/logs", requireSession, requireRoleSession("admin"), listLogs);
