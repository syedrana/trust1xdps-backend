const multer = require("multer");
const path = require("path");

// File storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, path.join(__dirname, '../uploads')) // ✅ Corrected path
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
        cb(null, true);
    } else {
        cb(new Error("Only jpeg, jpg, png, webp formats are allowed"));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: fileFilter,
});

module.exports = upload;
