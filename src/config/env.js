import dotenv from "dotenv";
dotenv.config();

const bool = (v)=> String(v).toLowerCase() === "true"; // convert string to boolean


export const env = {
  NODE_ENV: process.env.NODE_ENV || "development", //environment
  PORT: Number(process.env.PORT || 3000),
  SESSION_SECRET: process.env.SESSION_SECRET || "change-this-session-secret",// session secret
  SESSION_NAME: process.env.SESSION_NAME || "sid", // session cookie name
  SESSION_DOMAIN: process.env.SESSION_DOMAIN || undefined, // session cookie domain
  SESSION_SECURE: bool(process.env.SESSION_SECURE || false), // session cookie secure flag
  JWT_SECRET: process.env.JWT_SECRET || "change-this-jwt-secret", // JWT secret
  JWT_EXPIRES: Number(process.env.JWT_EXPIRES || 900),  // JWT expiration time in seconds
  JWT_REFRESH_EXPIRES: Number(process.env.JWT_REFRESH_EXPIRES || 7*24*3600), // JWT refresh expiration time in seconds
  DB_PATH: process.env.DB_PATH || "./data/auth.sqlite", // database path
};
