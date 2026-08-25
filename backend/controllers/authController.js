const { loginUser, registerUser } = require("../services/authService");
const {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} = require("../utils/authCookie");

const logDevelopmentError = (label, error) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(`${label}:`, {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      validationErrors: error.errors
        ? Object.keys(error.errors)
        : undefined,
    });
  }
};

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    logDevelopmentError("Registration failed", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to register user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { token, user } = await loginUser(req.body);
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user },
    });
  } catch (error) {
    logDevelopmentError("Login failed", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode === 401
        ? "Invalid email or password"
        : "Unable to login user",
    });
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

const logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions(false));
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

module.exports = { getCurrentUser, login, logout, register };