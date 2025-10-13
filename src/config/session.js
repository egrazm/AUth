import session from "express-session";  //express-session manages user sessions in Express.js applications
import connectSqlite3 from "connect-sqlite3";
import fs from "fs";
import { env } from "./env.js";

// store session data in SQLite database
const SQLiteStore = connectSqlite3(session);

+fs.mkdirSync("./data", { recursive: true });
//middleware to handle user sessions
export function sessionMiddleware(){
  return session({
    // SQLite session store configuration
    store: new SQLiteStore({ db: "sessions.sqlite", dir: "./data" }),
    // session cookie name
    name: env.SESSION_NAME,
    // secret key to sign the session ID cookie
    secret: env.SESSION_SECRET,
    // don't save session if unmodified
    resave: false,
    // don't create session until something stored (optimize storage)
    saveUninitialized: false,
    

    rolling: true,

    // cookie settings
    cookie: {
      // make cookie accessible only by the web server
      httpOnly: true,
      // helps protect against CSRF attacks
      sameSite: "lax",
      // use secure cookies in production (HTTPS)
      secure: env.SESSION_SECURE,
      // cookie expiration time (7 days)
      maxAge: 7*24*3600*1000,
      // cookie valid for this domain only
      domain: env.SESSION_DOMAIN || undefined,
    }
  });
}
