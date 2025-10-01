export function normEmail(v){
  const s = String(v ?? "").trim().toLowerCase();
  if (s.length > 256) throw new Error("email demasiado largo");
  return s;
}
export function normPassword(v){
  const s = String(v ?? "").trim();
  if (s.length > 256) throw new Error("password demasiado larga");
  return s;
}
export function validateEmail(e){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
export function validatePassword(p){
  return typeof p === "string" && p.length >= 10;
}
