
const User = require("../../models/user.model");
const ApiError = require("../../utils/api-error.util");
const catchAsync = require("../../utils/catch-async.util");
const { USER_ROLE } = require("../../constants/user.constant");

// 1. Get all customers
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const skip = (page - 1) * limit;

    const filter = { role: USER_ROLE.USER };

    if (req.query.search) {
        const search = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ];
    }

    if (req.query.status === "active") {
        filter.isActive = true;
    } else if (req.query.status === "inactive") {
        filter.isActive = false;
    }

    const [users, totalUsers] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter)
    ]);

    res.status(200).json({
        status: "success",
        results: users.length,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        data: users
    });
});

// 2. Get one customer
exports.getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findOne({
        _id: req.params.id,
        role: USER_ROLE.USER
    }).select("-password");

    if (!user) {
        return next(new ApiError("Customer not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Customer fetched successfully",
        data: user
    });
});

// 3. Update permitted customer fields
exports.updateUser = catchAsync(async (req, res, next) => {
    const { name, phone, address } = req.body;

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    if (Object.keys(updates).length === 0) {
        return next(
            new ApiError("Provide at least one permitted field to update", 400)
        );
    }

    const user = await User.findOneAndUpdate(
        {
            _id: req.params.id,
            role: USER_ROLE.USER
        },
        { $set: updates },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!user) {
        return next(new ApiError("Customer not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Customer updated successfully",
        data: user
    });
});

// 4. Activate or deactivate a customer
exports.updateUserStatus = catchAsync(async (req, res, next) => {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
        return next(
            new ApiError("isActive must be true or false", 400)
        );
    }

    const user = await User.findOneAndUpdate(
        {
            _id: req.params.id,
            role: USER_ROLE.USER
        },
        { $set: { isActive } },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!user) {
        return next(new ApiError("Customer not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: isActive
            ? "Customer account activated successfully"
            : "Customer account deactivated successfully",
        data: user
    });
});

// 5. Delete a customer
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findOneAndDelete({
        _id: req.params.id,
        role: USER_ROLE.USER
    });

    if (!user) {
        return next(new ApiError("Customer not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Customer deleted successfully"
    });
});
