import express from "express";
import { loginJwt, meJwt, adminJwt } from "../controllers/auth.controller.js";
import { listLogs } from "../controllers/admin.controller.js";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";

export const authRouter = express.Router();

authRouter.post("/login-jwt", loginJwt);
authRouter.post("/logout-jwt", (req,res)=> res.json({ ok:true }));
authRouter.get("/me-jwt", meJwt);
authRouter.get("/admin-jwt", adminJwt);
authRouter.get("/admin-logs-jwt", (req,res)=>{
  try{
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (payload.role !== "admin") return res.status(403).json({ error: "Prohibido" });
    return listLogs(req, res);
  }catch(e){
    return res.status(401).json({ error: "Token invalido" });
  }
});
