import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const stmtLog = db.prepare(`INSERT INTO security_logs
(id, created_at, ip, path, event, email, user_id, success, reason)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

export function logSecurity(req, { event, email=null, userId=null, success=1, reason=null }){
  try {
    stmtLog.run(uuidv4(), Date.now(), req.ip, req.path, event, email, userId, success?1:0, reason);
  } catch(e){
    // swallow to avoid crashing
  }
}
