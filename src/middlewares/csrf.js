//Middleware to protect against CSRF attacks
import csurf from "csurf";
//CSRF protection using csurf middleware, storing tokens in session (not cookies)
export const csrfProtection = csurf({ cookie: false });
