const mongoose = require("mongoose");

const { TABLE_NAME_CONSTANT } = require("../constants/table-name.constant");
const { PRODUCT_CATEGORY, PRODUCT_STATUS } = require("../constants/product.constant");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true
        },

        category: {
            type: String,
            enum: Object.values(PRODUCT_CATEGORY),
            required: true
        },

        images: {
            type: [String]
        },

        status: {
            type: String,
            enum: Object.values(PRODUCT_STATUS),
            default: PRODUCT_STATUS.AVAILABLE
        },

        isFeatured: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(TABLE_NAME_CONSTANT.PRODUCT, productSchema);
