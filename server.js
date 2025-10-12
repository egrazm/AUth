import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";

import { env } from "./src/config/env.js";
import { sessionMiddleware } from "./src/config/session.js";

import { indexRouter } from "./src/routes/index.routes.js";
import { sessionRouter } from "./src/routes/session.routes.js";
import { authRouter } from "./src/routes/auth.routes.js";

const app = express();
const IS_PROD = env.NODE_ENV === "production";

if (IS_PROD) app.set("trust proxy", 1);

// Base security
app.use(helmet());
app.disable("x-powered-by");
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sessions
app.use(sessionMiddleware());

// Static
app.use(express.static("public"));

// Routers
app.use("/", indexRouter);
app.use("/session", sessionRouter);
app.use("/auth", authRouter);

// Error handler (CSRF, etc.)
app.use((err, _req, res, _next) => {
  if (err && err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "CSRF token inválido" });
  }
  return res.status(500).json({ error: "Error interno" });
});

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
