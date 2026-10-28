const mongoose = require("mongoose");
const { USER_ROLE } = require("../constants/user.constant");
const { TABLE_NAME_CONSTANT } = require("../constants/table-name.constant");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            street: {
                type: String,
                trim: true
            },

            city: {
                type: String,
                trim: true
            },

            state: {
                type: String,
                trim: true
            },

            pincode: {
                type: String,
                trim: true
            }
        },

        role: {
            type: String,
            enum: Object.values(USER_ROLE),
            default: "user"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(TABLE_NAME_CONSTANT.USER, userSchema);