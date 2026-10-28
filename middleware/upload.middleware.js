
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_BASE_PATH = "uploads";
const IMAGE_SIZE_LIMIT = 5; // MB

exports.uploadMiddleware = (folder = "products") => {
    const uploadDir = path.join(
        process.cwd(),
        UPLOAD_BASE_PATH,
        folder
    );

    fs.mkdirSync(uploadDir, { recursive: true });

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },

        filename: (req, file, cb) => {
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);

            const extension = path.extname(file.originalname).toLowerCase();

            cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
        }
    });

    const imageFilter = (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            return cb(null, true);
        }

        cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    };

    return multer({
        storage,
        fileFilter: imageFilter,
        limits: {
            fileSize: IMAGE_SIZE_LIMIT * 1024 * 1024,
            files: 5
        }
    });
};

