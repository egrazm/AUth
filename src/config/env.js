import dotenv from "dotenv";
dotenv.config();

const bool = (v)=> String(v).toLowerCase() === "true";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),
  SESSION_SECRET: process.env.SESSION_SECRET || "change-this-session-secret",
  SESSION_NAME: process.env.SESSION_NAME || "sid",
  SESSION_DOMAIN: process.env.SESSION_DOMAIN || undefined,
  SESSION_SECURE: bool(process.env.SESSION_SECURE || false),
  JWT_SECRET: process.env.JWT_SECRET || "change-this-jwt-secret",
  JWT_EXPIRES: Number(process.env.JWT_EXPIRES || 900),
  JWT_REFRESH_EXPIRES: Number(process.env.JWT_REFRESH_EXPIRES || 7*24*3600),
  DB_PATH: process.env.DB_PATH || "./data/auth.sqlite",
};
