const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// Đảm bảo thư mục tồn tại
const uploadDir = path.join(__dirname, '../../public/uploads/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Kiểm tra và tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh!'));
    }
}).single('image');

// Upload ảnh
router.post('/image', auth, (req, res) => {
    upload(req, res, function(err) {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Lỗi khi upload ảnh'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng upload file ảnh'
            });
        }

        // Log thông tin file đã upload
        console.log('File uploaded:', {
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });

        res.json({
            success: true,
            url: `/uploads/images/${req.file.filename}`
        });
    });
});

module.exports = router; 