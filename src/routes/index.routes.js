import express from "express";
export const indexRouter = express.Router();

indexRouter.get("/health", (_req, res)=> res.json({ ok:true }));
