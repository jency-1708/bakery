const ApiError = require("../../utils/api-error.util");
const catchAsync = require("../../utils/catch-async.util");
const User = require("../../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ApiError("User with this email already exists.", 409))
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone
    })

    res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: user
    })
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ApiError("Invalid email or password", 401));
    };

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return next(new ApiError("Invalid email or password", 401));
    }

    const token = jwt.sign(
        {
            userId: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    res.status(200).json({
        status: "success",
        message: "Login successfull",
        data: user,
        token
    })
})

exports.getMyProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new ApiError("User not found.", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Profile fetched successfully",
        data: user
    });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });

    if (!user) {
        return next(new ApiError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        data: user
    })
})