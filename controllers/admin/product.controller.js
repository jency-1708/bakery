const Product = require("../../models/product.model");
const ApiError = require("../../utils/api-error.util");
const catchAsync = require("../../utils/catch-async.util");
const ApiFeatures = require("../../utils/api.features.util")
const { PRODUCT_STATUS } = require("../../constants/product.constant");
const { deleteFile } = require("../../utils/image.util");

exports.createProduct = catchAsync(async (req, res, next) => {
    const {
        name,
        description,
        price,
        category,
        status,
        isFeatured
    } = req.body;

    const images = (req.files || []).map(
        (file) => `/uploads/products/${file.filename}`
    );

    const product = await Product.create({
        name,
        description,
        price: Number(price),
        category,
        status,
        isFeatured: isFeatured === "true",
        images
    });

    res.status(201).json({
        status: "success",
        message: "Product created successfully",
        data: product
    });
});



exports.getAllProducts = catchAsync(async (req, res, next) => {
    const { search, category } = req.query;

    const whereCondition = {
        status: "available"
    };

    if (search) {
        whereCondition.name = {
            $regex: search,
            $options: "i"
        };
    }

    if (category) {
        whereCondition.category = category;
    }

    const features = new ApiFeatures(Product, req.query)
        .whereClause(whereCondition)
        .paginate();

    const result = await features.exec();

    res.status(200).json({
        status: "success",
        results: result.data.length,
        total_document: result.total_document,
        data: result.data
    });
});

exports.getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        return next(new ApiError("Product not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Product fetched successfully",
        data: product
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        return next(new ApiError("Product not found", 404));
    }

    const {
        name,
        description,
        price,
        category,
        status,
        isFeatured
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (status !== undefined) product.status = status;

    if (isFeatured !== undefined) {
        product.isFeatured = isFeatured === "true";
    }

   if (req.files && req.files.length > 0) {
    const oldImages = product.images || [];

    product.images = req.files.map(
        (file) => `/uploads/products/${file.filename}`
    );

    await product.save();

    oldImages.forEach((image) => {
        deleteFile(image);
    });
} else {
    await product.save();
}
    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return next(new ApiError("Product not found", 404));

    res.status(200).json({
        status: "success",
        message: "Product deleted successfully"
    })
});

exports.removeProductImage = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { image } = req.body;

    if (!image) {
        return next(new ApiError("Image path is required", 400));
    }

    const product = await Product.findById(id);

    if (!product) {
        return next(new ApiError("Product not found", 404));
    }

    if (!product.images.includes(image)) {
        return next(new ApiError("Image not found in this product", 404));
    }

    product.images = product.images.filter(
        (productImage) => productImage !== image
    );

    await product.save();

    deleteFile(image);

    res.status(200).json({
        success: true,
        message: "Product image removed successfully",
        data: product
    });
});