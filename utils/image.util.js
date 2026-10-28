const fs = require("fs");
const path = require("path");

const deleteFile = (imageUrl) => {
    if (!imageUrl) return;

    const filename = path.basename(imageUrl);

    const filePath = path.join(
        process.cwd(),
        "uploads",
        "products",
        filename
    );

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = { deleteFile };