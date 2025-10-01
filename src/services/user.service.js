import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const stmtFindByEmail = db.prepare("SELECT * FROM users WHERE email = ?");
export const stmtFindById = db.prepare("SELECT * FROM users WHERE id = ?");
export const stmtCreate = db.prepare("INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)");
export const stmtUpdateFailed = db.prepare("UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?");

export function createUser({ email, password_hash, role='user' }){
  const id = uuidv4();
  stmtCreate.run(id, email, password_hash, role, Date.now());
  return stmtFindById.get(id);
}
