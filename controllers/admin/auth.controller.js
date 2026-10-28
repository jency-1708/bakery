
const User = require("../../models/user.model");
const ApiError = require("../../utils/api-error.util");
const catchAsync = require("../../utils/catch-async.util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const admin = await User.findOne({
        email: email.toLowerCase().trim(),
        role: "admin"
    }).select("+password");

    if (!admin || !admin.isActive) {
        return next(
            new ApiError("Invalid email or password", 401)
        );
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        admin.password
    );

    if (!isPasswordValid) {
        return next(
            new ApiError("Invalid email or password", 401)
        );
    }

    const token = jwt.sign(
        { userId: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
        status: "success",
        message: "Admin login successful",
        data: adminData,
        token
    });
});

exports.getMyProfile = catchAsync(async (req, res, next) => {
    const admin = await User.findOne({
        _id: req.user._id,
        role: "admin",
        isActive: true
    });

    if (!admin) {
        return next(new ApiError("Admin not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Admin profile fetched successfully",
        data: admin
    });
});
