
const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/admin.middleware");
const userController = require("../../controllers/admin/user.controller");

router.use(protect, adminOnly);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id/status", userController.updateUserStatus);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
