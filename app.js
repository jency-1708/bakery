const express = require('express');
const cors = require("cors");
const path = require("path");

const userAuthRoutes = require("./routes/user/auth.route");
const AdminproductRoutes = require("./routes/admin/product.route");
const adminAuthRoutes = require("./routes/admin/auth.route");


const globalErrorHandler = require("./utils/error.util");

const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
//Health check
app.get("/",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Backend API is running"
    });
});

app.use("/api/user/auth",userAuthRoutes);

app.use("/api/admin/product",AdminproductRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

app.use(globalErrorHandler);
module.exports = app;