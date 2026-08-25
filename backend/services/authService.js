const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_PASSWORD_LENGTH = 8;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";
const AUTHENTICATION_REQUIRED_MESSAGE = "Authentication required";
const ALLOWED_ROLES = ["health_worker", "admin"];

const isAllowedRole = (role) => ALLOWED_ROLES.includes(role);

const registerUser = async ({ name, email, phone, password } = {}) => {
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";

  if (!normalizedName || !normalizedEmail || !normalizedPhone || !password) {
    const error = new Error("Name, email, phone, and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    const error = new Error("Please provide a valid email address");
    error.statusCode = 400;
    throw error;
  }

  if (typeof password !== "string" || password.length < MINIMUM_PASSWORD_LENGTH) {
    const error = new Error("Password must be at least 8 characters long");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  try {
    return await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error("An account with this email already exists");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};

const loginUser = async ({ email, password } = {}) => {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedEmail || typeof password !== "string" || !password) {
    const error = new Error(INVALID_CREDENTIALS_MESSAGE);
    error.statusCode = 401;
    throw error;
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    const error = new Error(INVALID_CREDENTIALS_MESSAGE);
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (
    !user ||
    !isAllowedRole(user.role) ||
    !(await bcrypt.compare(password, user.password))
  ) {
    const error = new Error(INVALID_CREDENTIALS_MESSAGE);
    error.statusCode = 401;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

const getPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const authenticateToken = async (token) => {
  if (!token || !process.env.JWT_SECRET) {
    const error = new Error(AUTHENTICATION_REQUIRED_MESSAGE);
    error.statusCode = 401;
    throw error;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.userId || !isAllowedRole(payload.role)) {
      throw new Error("Invalid token payload");
    }

    const user = await User.findById(payload.userId);
    if (!user || !isAllowedRole(user.role) || user.role !== payload.role) {
      throw new Error("Authenticated user not found");
    }

    return getPublicUser(user);
  } catch (error) {
    const authenticationError = new Error(AUTHENTICATION_REQUIRED_MESSAGE);
    authenticationError.statusCode = 401;
    throw authenticationError;
  }
};

module.exports = {
  ALLOWED_ROLES,
  authenticateToken,
  getPublicUser,
  isAllowedRole,
  loginUser,
  registerUser,
};