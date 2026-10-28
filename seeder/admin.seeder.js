
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/user.model");
const { USER_ROLE } = require("../constants/user.constant");

const seedAdmin = async () => {
    try {
        await connectDB();

        const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const password = process.env.ADMIN_PASSWORD;
        const name = process.env.ADMIN_NAME || "Bakery Admin";
        const phone = process.env.ADMIN_PHONE;

        if (!email || !password || !phone) {
            throw new Error(
                "Please set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_PHONE in .env"
            );
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.role === USER_ROLE.ADMIN) {
                console.log("Admin account already exists.");
                return;
            }

            throw new Error(
                "This email already belongs to a non-admin user."
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: USER_ROLE.ADMIN
        });

        console.log("Admin account created successfully.");
    } catch (error) {
        console.error("Admin seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin();
