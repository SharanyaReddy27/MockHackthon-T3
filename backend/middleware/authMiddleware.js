const {
  authenticateToken,
  isAllowedRole,
} = require("../services/authService");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    const user = await authenticateToken(token);
    if (!isAllowedRole(user.role)) {
      throw new Error("Invalid authenticated role");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
};

module.exports = authMiddleware;