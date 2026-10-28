const createError = require("http-errors");

// CAST ERROR
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;

    return createError(400, message);
};

// MONGOOSE VALIDATION ERROR
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(
        (el) => el.message
    );

    const message = errors[0];

    return createError(422, message);
};

// DUPLICATE KEY ERROR
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];

    const message = `${field} already exists!`;

    return createError(422, message);
};

// JWT ERROR
const handleJWTError = () => {
    return createError(
        401,
        "Invalid token. Please log in again!"
    );
};

// JWT EXPIRED ERROR
const handleJWTExpiredError = () => {
    return createError(
        401,
        "Your token has expired! Please log in again."
    );
};

// FILE SIZE ERROR
const handleLimitFileSize = () => {
    const message =
        "File size is too large. Max allowed file size is 3 MB.";

    return createError(422, message);
};

// SEND ERROR
const sendError = (err, res) => {
    return res.status(err.statusCode || 500).json({
        success: false,
        status: err.status || "error",
        message: err.message || "Something went wrong"
    });
};

// GLOBAL ERROR HANDLER
const globalErrorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    let error = err;

    // Mongoose CastError
    if (error.name === "CastError") {
        error = handleCastErrorDB(error);
    }

    // Mongoose ValidationError
    if (error.name === "ValidationError") {
        error = handleValidationError(error);
    }

    // Multer file size error
    if (error.code === "LIMIT_FILE_SIZE") {
        error = handleLimitFileSize(error);
    }

    // MongoDB duplicate key
    if (error.code === 11000) {
        error = handleDuplicateKeyError(error);
    }

    // JWT invalid
    if (error.name === "JsonWebTokenError") {
        error = handleJWTError();
    }

    // JWT expired
    if (error.name === "TokenExpiredError") {
        error = handleJWTExpiredError();
    }

    console.error(
        `${error.name || "Error"}: ${error.message || error}`
    );

    sendError(error, res);
};

module.exports = globalErrorHandler;