import Database from "better-sqlite3";
import fs from "fs"; // file system manages directories and files in Node.js
import path from "path"; //built-in Node.js module for handling and transforming file paths

import { env } from "./env.js";

const dbDir = path.dirname(env.DB_PATH);

// Create directory if it doesn't exist recursive means subdirectories will be created as needed
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true }); 
export const db = new Database(env.DB_PATH);

// Enable Write-Ahead Logging for better concurrency and performance prevents database locking issues
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS security_logs(
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  ip TEXT,
  path TEXT,
  event TEXT,
  email TEXT,
  user_id TEXT,
  success INTEGER,
  reason TEXT
);
`);
