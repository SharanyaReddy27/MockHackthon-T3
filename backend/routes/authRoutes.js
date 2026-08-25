const express = require("express");
const {
	getCurrentUser,
	login,
	logout,
	register,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;