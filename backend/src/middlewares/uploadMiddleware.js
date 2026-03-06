import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// Check file Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /py|html|css|zip|pdf|docx|txt|js|jsx/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype) || file.mimetype.includes('zip') || file.mimetype.includes('octet-stream');

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Incompatible file type!');
    }
}

export const upload = multer({
    storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});
