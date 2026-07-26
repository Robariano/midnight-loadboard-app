export function isAdminRequest(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_pw=([^;]+)/);
  if (!match) return false;
  const value = decodeURIComponent(match[1]);
  return value === process.env.ADMIN_PASSWORD;
}
