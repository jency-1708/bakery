const jwt = require("jsonwebtoken");
const ApiError = require("../utils/api-error.util");
const catchAsync = require("../utils/catch-async.util");
const User = require("../models/user.model");



exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(
            new ApiError("Please login to access this resource.", 401)
        );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
        return next(
            new ApiError("User no longer exists or is inactive.", 401)
        );
    }

    req.user = user;
    next();
});


