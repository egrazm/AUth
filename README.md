# 🛡️ Passport Auth (Modularizado)

Sistema de autenticación en **Node.js + Express** con soporte para **sesiones (cookies + CSRF)** y **JWT (tokens sin estado)**.  
Incluye buenas prácticas de seguridad con **Helmet**, **rate limiting**, **bcrypt**, **SQLite3**, y un front-end demo simple en `public/`.

---

## 🚀 Características

- Registro de usuarios con **hash de contraseñas (bcrypt)**.
- Autenticación con:
  - **Sesiones + Cookies** protegidas con CSRF.
  - **JWT** para APIs sin estado.
- Roles de usuario (`user` / `admin`).
- **Logs de seguridad** (intentos fallidos, bloqueos, etc.).
- Protección extra:
  - Helmet (CSP, HSTS, ReferrerPolicy, CORP, COOP).
  - Rate limit en logins.
  - Bloqueo temporal por intentos fallidos.
- Estructura modular de carpetas.

---

## 📂 Estructura del proyecto

```
passport-auth_modularized/
├── public/                # Frontend demo
├── src/
│   ├── config/            # Configuración (env, db, session)
│   ├── controllers/       # Controladores de rutas
│   ├── middlewares/       # Middlewares personalizados
│   ├── routes/            # Rutas agrupadas
│   ├── services/          # Servicios de BD (users, logs)
│   └── utils/             # Utilidades (validador, logger)
├── server.js              # Entry point
├── package.json
└── .env.example           # Variables de entorno de ejemplo
```

---

## ⚙️ Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/egrazm/AUth.git
   cd AUth
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Iniciar el servidor:
   ```bash
   node server.js
   # o en desarrollo
   npm run dev
   ```

---

## 🔑 Variables de entorno (`.env`)

```env
# Entorno
NODE_ENV=development
PORT=3000

# Sesiones
SESSION_SECRET=tu-clave-super-secreta
SESSION_NAME=sid
SESSION_SECURE=false

# JWT
JWT_SECRET=otra-clave-super-secreta
JWT_EXPIRES=900            # 15 minutos
JWT_REFRESH_EXPIRES=604800 # 7 días

# Base de datos
DB_PATH=./data/auth.sqlite
```

---

## 🧩 Endpoints principales

### 🌐 Salud
- `GET /health`

### 🧑‍💻 Sesión (cookies + CSRF)
- `GET /session/csrf-token`
- `POST /session/auth/register`
- `POST /session/auth/login`
- `POST /session/auth/logout`
- `GET /session/me`
- `GET /session/admin` *(solo admins)*
- `GET /session/logs` *(solo admins)*

### 🔐 JWT
- `POST /auth/login-jwt`
- `POST /auth/logout-jwt`
- `GET /me-jwt`
- `GET /admin-jwt` *(solo admins)*
- `GET /admin-logs-jwt` *(solo admins)*

---

## 🖥️ Demo Frontend

En `public/index.html` hay un **mini front** para probar:
- Registro de usuario.
- Login con sesión (cookie + CSRF).
- Login con JWT.
- Consultar datos de usuario.
- Probar endpoints de admin.

Se sirve automáticamente en [`http://localhost:3000`](http://localhost:3000).

---

## 🛡️ Seguridad

- Contraseñas **encriptadas con bcrypt**.
- Bloqueo automático tras intentos fallidos.
- **CSRF token** en rutas de sesión.
- **JWT firmado** con expiración configurable.
- Políticas estrictas con **Helmet**.

