const express = require("express");
const router = express.Router();

const productController = require("../../controllers/admin/product.controller");
const { protect } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/admin.middleware");
const { uploadMiddleware } = require("../../middleware/upload.middleware");
const upload = uploadMiddleware("products");

router.post("/create", protect, adminOnly, upload.array("images", 5), productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.patch("/update/:id", protect, adminOnly, upload.array("images", 5), productController.updateProduct);
router.delete("/delete/:id", protect, adminOnly, productController.deleteProduct);
router.delete("/:id/images", protect, adminOnly, productController.removeProductImage);


module.exports = router;
