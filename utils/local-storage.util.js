const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    IMAGE_SIZE_CONSTANT,
    UPLOAD_BASE_PATH
} = require("../constants/folder-path.constant");

// File filter
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"));
    }
};

// Upload middleware factory
const uploadMiddleware = (folder) => {
    const uploadDir = folder
        ? path.join(process.cwd(), UPLOAD_BASE_PATH, folder)
        : path.join(process.cwd(), UPLOAD_BASE_PATH);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },

        filename: (req, file, cb) => {
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);

            const ext = path.extname(file.originalname);

            cb(
                null,
                `${file.fieldname}-${uniqueSuffix}${ext}`
            );
        }
    });

    return multer({
        storage,
        fileFilter: imageFilter,
        limits: {
            fileSize: IMAGE_SIZE_CONSTANT * 1024 * 1024
        }
    });
};


// Local Storage Helper
class LocalStorage {

    static getFilePath(file, folder) {
        return path.join(
            UPLOAD_BASE_PATH,
            folder,
            file.filename
        );
    }

    /**
     * Safely resolves a raw filename or DB relative path
     * to its absolute location on disk.
     */
    static getAbsolutePath(filePath) {

        if (!filePath) {
            return null;
        }

        // Normalize path
        const cleanPath = filePath
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");

        const targetFilename = path.basename(cleanPath);

        // 1. Direct path relative to process.cwd()
        let absolutePath = path.resolve(
            process.cwd(),
            cleanPath
        );

        if (fs.existsSync(absolutePath)) {
            return absolutePath;
        }

        // 2. Relative to UPLOAD_BASE_PATH
        absolutePath = path.resolve(
            process.cwd(),
            UPLOAD_BASE_PATH,
            cleanPath
        );

        if (fs.existsSync(absolutePath)) {
            return absolutePath;
        }

        // 3. Relative to public/
        absolutePath = path.resolve(
            process.cwd(),
            "public",
            cleanPath
        );

        if (fs.existsSync(absolutePath)) {
            return absolutePath;
        }

        // 4. Recursive search
        const searchRoots = [
            path.resolve(process.cwd(), UPLOAD_BASE_PATH),
            path.resolve(process.cwd(), "public"),
            path.resolve(
                process.cwd(),
                "public",
                UPLOAD_BASE_PATH
            )
        ];

        for (const root of searchRoots) {

            if (fs.existsSync(root)) {

                const foundPath =
                    LocalStorage.findFileRecursive(
                        root,
                        targetFilename
                    );

                if (foundPath) {
                    return foundPath;
                }
            }
        }

        console.warn(
            `[LocalStorage] File not found on disk: ${filePath}`
        );

        return null;
    }

    /**
     * Recursively search for a filename
     * inside a directory.
     */
    static findFileRecursive(dir, filename) {

        try {

            const entries = fs.readdirSync(dir, {
                withFileTypes: true
            });

            for (const entry of entries) {

                const fullPath = path.join(
                    dir,
                    entry.name
                );

                if (entry.isDirectory()) {

                    const found =
                        LocalStorage.findFileRecursive(
                            fullPath,
                            filename
                        );

                    if (found) {
                        return found;
                    }

                } else if (
                    entry.isFile() &&
                    entry.name === filename
                ) {

                    return fullPath;
                }
            }

        } catch (error) {
            // Ignore unreadable directory errors
        }

        return null;
    }

    static async delete(filePath) {

        if (!filePath) {
            return;
        }

        try {

            const absolutePath = path.resolve(
                process.cwd(),
                filePath
            );

            if (fs.existsSync(absolutePath)) {
                await fs.promises.unlink(absolutePath);
            }

            console.log(
                `Image Deleted Successfully: ${path.basename(filePath)}`
            );

        } catch (error) {

            console.error(
                `Failed to delete file at ${filePath}:`,
                error
            );
        }
    }

    static getUrl(filePath) {

        const baseUrl =
            process.env.BASE_URL ||
            "http://localhost:3000";

        let formattedPath = filePath
            .replace(/\\/g, "/");

        if (!formattedPath.startsWith("/")) {
            formattedPath = `/${formattedPath}`;
        }

        return `${baseUrl}${formattedPath}`;
    }
}


module.exports = {
    uploadMiddleware,
    LocalStorage
};