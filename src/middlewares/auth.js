//Middlewares that require authentication/authorization

export function requireSession(req, res, next){
  //if session does not have userId, return 401
  if (!req.session.userId) return res.status(401).json({ error: "No autenticado" });
 //otherwise proceed to next middleware
  next();
}

//Middleware to require specific user role in session-based auth
export function requireRoleSession(role){
  //return middleware function
  return (req,res,next)=>{
    //if session does not have userId, return 401
    if (req.session.role !== role) return res.status(403).json({ error: "Prohibido" });
    next();

  };
}
//Middleware to require JWT authentication
export function requireJwt(req,res,next){
  //Extract token from Authorization header
  const auth = req.headers.authorization || "";
  const [, token] = auth.split(" "); //divides ["Bearer", "token"]

  //if no token, return 401
  if (!token) return res.status(401).json({ error: "Token requerido" });

  //saves token in request object for later use
  req._token = token;
  next();
}
