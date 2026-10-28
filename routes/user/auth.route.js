const express = require("express");
const router = express.Router();

const validate = require("../../middleware/validation.middleware")
const { registerValidator, loginValidator } = require("../../validations/user/auth.validation");
const { register, login, getMyProfile, updateMyProfile } = require("../../controllers/user/auth.controller")
const { protect } = require("../../middleware/auth.middleware")

router.post("/register", validate(registerValidator), register);
router.post("/login", validate(loginValidator), login);
router.get("/me/:id", protect, getMyProfile);
router.patch("/me-update/:id", protect, updateMyProfile)

module.exports = router;