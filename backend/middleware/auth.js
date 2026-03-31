const { getUserByToken } = require("../services/authService");

function authMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token is missing.",
    });
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({
      message: "Token is invalid or expired.",
    });
  }

  req.user = user;
  return next();
}

module.exports = authMiddleware;
