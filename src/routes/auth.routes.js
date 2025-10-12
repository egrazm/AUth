import express from "express";
import { loginJwt, meJwt, adminJwt } from "../controllers/auth.controller.js";
import { listLogs } from "../controllers/admin.controller.js";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";

//Create a new router for auth routes
export const authRouter = express.Router();

// Define the routes for JWT authentication
authRouter.post("/login-jwt", loginJwt);

// Define the logout, me, and admin routes
authRouter.post("/logout-jwt", (req,res)=> res.json({ ok:true }));

// Middleware to check if the user is authenticated
authRouter.get("/me-jwt", meJwt);

// Admin routes 
authRouter.get("/admin-jwt", adminJwt);

// Admin logs route with JWT verification
authRouter.get("/admin-logs-jwt", (req,res)=>{

  try{

    // 1) Extract the token from the Authorization header
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");

    // 2) Verify the token with the JWT secret
    const payload = jwt.verify(token, env.JWT_SECRET);

    // 3) Checks if the user has admin role
    if (payload.role !== "admin") return res.status(403).json({ error: "Prohibido" });
    return listLogs(req, res);
  }catch(e){
    return res.status(401).json({ error: "Token invalido" });
  }
});
