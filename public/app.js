(function () {
  const $ = (id) => document.getElementById(id);
  const out = $("out");
  const log = (x) => {
    const msg = typeof x === "string" ? x : JSON.stringify(x, null, 2);
    if (out) out.textContent = msg;
    console.log("[UI]", msg);
  };

  let csrfToken = "";
  let jwtToken = "";

  async function getCsrf() {
    try {
      const r = await fetch("/session/csrf-token", {
        method: "GET",
        credentials: "include",
      });
      const data = await r.json();
      csrfToken = data.csrfToken;
      const el = $("csrf");
      if (el) el.textContent = csrfToken;
      return csrfToken;
    } catch (e) {
      log({ error: "No se pudo obtener CSRF", detail: String(e) });
    }
  }

  async function checkSession() {
    const r = await get("/session/me");
    const status = document.getElementById("session-status");
    if (status){
      if (r.ok) {
        status.textContent = `Logueado: id=${r.data.id} · rol=${r.data.role}`;
        status.dataset.logged = "1";
      } else {
        status.textContent = "No logueado";
        status.dataset.logged = "0";
      }
    }
  }

  async function rawPost(url, body = {}, extraHeaders = {}) {
    try {
      const r = await fetch(url, {
        method: "POST",
        credentials: "include", // cookies para /session/*
        headers: { "Content-Type": "application/json", ...extraHeaders },
        body: JSON.stringify(body),
      });
      const text = await r.text();
      let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
      return { ok: r.ok, status: r.status, data: json };
    } catch (e) {
      return { ok: false, status: 0, data: { error: String(e) } };
    }
  }

  // Post con reintento 1 vez si hay 403 por CSRF vencido
  async function postCsrf(url, body = {}) {
    let r = await rawPost(url, body, { "x-csrf-token": csrfToken });
    if (!r.ok && r.status === 403) {
      await getCsrf();
      r = await rawPost(url, body, { "x-csrf-token": csrfToken });
    }
    return r;
  }

  async function get(url, extraHeaders = {}) {
    try {
      const r = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { ...extraHeaders },
      });
      const text = await r.text();
      let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
      return { ok: r.ok, status: r.status, data: json };
    } catch (e) {
      return { ok: false, status: 0, data: { error: String(e) } };
    }
  }

  function bind() {
    const map = [
      // Refrescar CSRF
      ["btn-csrf", async () => { await getCsrf(); log("CSRF actualizado"); }],

      // === REGISTROS (dos botones) ===
      ["btn-session-register-user", async () => {
        const email = $("s-email").value.trim();
        const password = $("s-pass").value;
        const r = await postCsrf("/session/auth/register", { email, password, role: "user" });
        // tras registrar, quedás logueado → refrescamos token para la nueva sesión
        if (r.ok) await getCsrf();
        log(r);
      }],
      ["btn-session-register-admin", async () => {
        const email = $("s-email").value.trim();
        const password = $("s-pass").value;
        const r = await postCsrf("/session/auth/register", { email, password, role: "admin" });
        if (r.ok) await getCsrf();
        log(r);
      }],

      // (compatibilidad, por si aún existe el viejo botón genérico)
      ["btn-session-register", async () => {
        const email = $("s-email").value.trim();
        const password = $("s-pass").value;
        const r = await postCsrf("/session/auth/register", { email, password, role: "user" });
        if (r.ok) await getCsrf();
        log(r);
      }],

      // Login / Logout (refrescan CSRF)
      ["btn-session-login", async () => {
        const email = $("s-email").value.trim();
        const password = $("s-pass").value;
        const r = await postCsrf("/session/auth/login", { email, password });
        if (r.ok) await getCsrf(); // nueva sesión → nuevo token
        log(r);
      }],
      ["btn-session-logout", async () => {
        const r = await postCsrf("/session/auth/logout", {});
        await getCsrf(); // sesión destruida → pedimos token nuevo
        log(r);
      }],

      // Info / Admin (sesión)
      ["btn-session-me", async () => log(await get("/session/me"))],
      ["btn-session-admin", async () => log(await get("/session/admin"))],
      ["btn-session-logs", async () => log(await get("/session/logs"))],

      // === JWT ===
      ["btn-jwt-login", async () => {
        const email = $("j-email").value.trim();
        const password = $("j-pass").value;
        const r = await rawPost("/auth/login-jwt", { email, password });
        if (r.ok && r.data.token) {
          jwtToken = r.data.token;
          const el = $("jwt");
          if (el) el.textContent = jwtToken;
        }
        log(r);
      }],
      ["btn-jwt-me", async () => log(await get("/auth/me-jwt", { Authorization: `Bearer ${jwtToken}` }))],
      ["btn-jwt-admin", async () => log(await get("/auth/admin-jwt", { Authorization: `Bearer ${jwtToken}` }))],
      ["btn-jwt-logs", async () => log(await get("/auth/admin-logs-jwt", { Authorization: `Bearer ${jwtToken}` }))],
      ["btn-jwt-logout", async () => { jwtToken = ""; const el = $("jwt"); if (el) el.textContent = ""; log(await rawPost("/auth/logout-jwt", {})); }],
    ];

    const missing = [];
    for (const [id, fn] of map) {
      const el = $(id);
      if (el) el.onclick = fn;
      else missing.push(id);
    }
    if (missing.length) {
      console.warn("Elementos no encontrados:", missing);
      log({ warning: "Algunos botones no existen en el DOM", missing });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
      bind();
      await getCsrf();
      await checkSession();
      log("Listo. CSRF inicial cargado.");
    });
  } else {
    bind();
    getCsrf().then(() => checkSession().then(() => log("Listo. CSRF inicial cargado.")));
  }
})();
