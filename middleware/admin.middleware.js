const ApiError = require("../utils/api-error.util");
const catchAsync = require("../utils/catch-async.util");
const { USER_ROLE } = require("../constants/user.constant");

exports.adminOnly = catchAsync(async (req, res, next) => {
    if (!req.user) {
        return next(new ApiError("Please login first.", 401));
    }

    if (req.user.role !== USER_ROLE.ADMIN) {
        return next(
            new ApiError("You are not authorized to perform this action.", 403)
        );
    }

    next();
});


