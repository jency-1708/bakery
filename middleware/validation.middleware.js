const createError = require("http-errors");
const ApiError = require("../utils/api-error.util");

const validation = (schema) => {
    return (req, res, next) => {
        console.log("VALIDATION BODY =>", req.body);
        console.log("VALIDATION FILE =>", req.file);

        if (!req.body) {
            return next(new ApiError("Request body is missing. Please provide the required data.", 400))
        }

        const { error } = schema.validate(req.body);

        if (error) {
            const validationError = new createError[400](error.message);
            return next(validationError);
        }
        next();
    };
};

module.exports = validation;