import { db } from "../config/db.js";
// Controller for admin-related operations

// List all log entries
export function listLogs(req, res){
  const logs = db.prepare("SELECT * FROM security_logs ORDER BY created_at DESC LIMIT 200").all();
  res.json({ logs });
}
