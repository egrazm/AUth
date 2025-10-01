import bcrypt from "bcrypt"; // bcrypt is a library to hash and verify passwords securely
import jwt from "jsonwebtoken"; // jsonwebtoken is used to create and verify JWT tokens
import { env } from "../config/env.js";
import { normEmail, normPassword, validateEmail, validatePassword } from "../utils/validators.js";
import { logSecurity } from "../utils/logger.js";
import { stmtFindByEmail, stmtUpdateFailed, createUser } from "../services/user.service.js";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

// Session-based authentication
export async function loginSession(req, res){
  try {
    //1)Extract and validate email and password from request body
    const { email, password } = req.body || {};
    const emailN = normEmail(email);
    const passwordN = normPassword(password);

    //2) Check if email and password are valid
    if (!validateEmail(emailN) || typeof passwordN !== "string") {
      return res.status(400).json({ error: "Credenciales invalidas" });
    }
    //3) Find user by email
    const user = stmtFindByEmail.get(emailN);
    if (!user) {
      logSecurity(req, { event: "login_base", email: emailN, success: 0, reason: "not_found" });
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    //4) Check if account is locked due to too many failed login attempts
    const now = Date.now();
    if (user.locked_until && now < user.locked_until) {
      const secs = Math.ceil((user.locked_until - now) / 1000);  
      logSecurity(req, { event: "login_base", email: user.email, userId: user.id, success: 0, reason: "locked" });
      return res.status(429).json({ error: `Cuenta bloqueada. Intenta en ${secs} segundos` });
    }

    //5) Verify password with bcrypt
    const ok = await bcrypt.compare(passwordN, user.password_hash);
    if (!ok) {
      // if fails increases failed counter
      const nextFailed = (user.failed_logins || 0) + 1;
      const lockUntil = nextFailed >= MAX_ATTEMPTS ? now + LOCK_MINUTES*60*1000 : null;
      stmtUpdateFailed.run(nextFailed, lockUntil, user.id);
      logSecurity(req, { event: "login_base", email: user.email, userId: user.id, success: 0, reason: "bad_password" });
      return res.status(401).json({ error: "Credenciales invalidas" });
    }
    // 6) On successful login reset failed counter and set session
    stmtUpdateFailed.run(0, null, user.id);
    req.session.userId = user.id;
    req.session.role = user.role;
    logSecurity(req, { event: "login_base", email: user.email, userId: user.id, success: 1 });
    //7) return user info
    return res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    return res.status(500).json({ error: "Error interno" });
  }
}
 
export async function registerSession(req, res){
  try {
    //1) Extract and validate email and password from request body
    const { email, password, role } = req.body || {};
    const emailN = normEmail(email);
    const passwordN = normPassword(password);

    //2) Validate email format and password strength
    if (!validateEmail(emailN)) return res.status(400).json({ error: "Email invalido" });
    if (!validatePassword(passwordN)) return res.status(400).json({ error: "Password invalida (minimo 10 caracteres)" });
    
    //3) Check if email is already registered
    if (stmtFindByEmail.get(emailN)) {
      logSecurity(req, { event: "register", email: emailN, success: 0, reason: "email_exists" });
      return res.status(409).json({ error: "El email ya esta registrado" });
    }

    //4) Hash password and create new user
    const hash = await bcrypt.hash(passwordN, 12);
    const finalRole = (role === "admin") ? "admin" : "user";
    const user = createUser({ email: emailN, password_hash: hash, role: finalRole });
    
    //5) Set session and return user info
    logSecurity(req, { event: "register", email: emailN, userId: user.id, success: 1 });
    return res.status(201).json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    return res.status(500).json({ error: "Error interno" });
  }
}

export function logoutSession(req, res){
  //destroy session on logout
  req.session.destroy(()=>{});
  return res.json({ ok: true });
}

export function meSession(req, res){
  //return user info from session
  return res.json({ id: req.session.userId, role: req.session.role });
}

// JWT
export async function loginJwt(req, res){
  try {
    //1)Extract and validate email and password from request body
    const { email, password } = req.body || {};
    const emailN = normEmail(email);
    const passwordN = normPassword(password);

    //2) Check if email and password are valid
    const user = stmtFindByEmail.get(emailN);
    if (!user) return res.status(401).json({ error: "Credenciales invalidas" });
    const ok = await bcrypt.compare(passwordN, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales invalidas" });
    
    //3) Create JWT token with user ID and role
    const payload = { sub: user.id, role: user.role };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES });
    
    //4) Return JWT token
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: "Error interno" });
  }
}

export function meJwt(req, res){
  try {
    // 1) Extract and verify JWT token from Authorization header
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");

    // 2) Verify token and extract payload
    const payload = jwt.verify(token, env.JWT_SECRET);
    
    // 3) Return user info from token payload
    return res.json({ id: payload.sub, role: payload.role });
  } catch (e) {
    return res.status(401).json({ error: "Token invalido" });
  }
}

export function adminJwt(req, res){
  try {
    // 1) Extract and verify JWT token from Authorization header
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");

    // 2) Verify token 
    const payload = jwt.verify(token, env.JWT_SECRET);

    // 3) Check if user has admin role
    if (payload.role !== "admin") return res.status(403).json({ error: "Prohibido" });
    
    // 4) Return success message for admin access
    return res.json({ ok: true, message: "Acceso admin" });
  } catch (e) {
    return res.status(401).json({ error: "Token invalido" });
  }
}
