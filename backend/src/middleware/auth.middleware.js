import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token missing or malformed." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.userInfo;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}

export const verifyRoles = (...allowesRoles) => {
  return (req, res, next) => {
    if (!req.user.role) {
      return res.status(403).json({ message: "Access denied: User role is not assigned." });
    }
    if (!allowesRoles.some(role => req.user.role === role)) {
      return res.status(403).json({ message: `Access denied: Requires one of the following roles: (${allowesRoles.join(", ") })`});
    }

    next();
}}