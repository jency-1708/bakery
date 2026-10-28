const express = require("express");
const router = express.Router();

const authController = require("../../controllers/admin/auth.controller");
const { protect } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/admin.middleware");

router.post("/login", authController.login);

router.get("/me", protect, adminOnly, authController.getMyProfile);

module.exports = router;
