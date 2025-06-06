const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const sharp = require('sharp');

// Cấu hình multer để upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Tạo tên file ngẫu nhiên để tránh trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: (req, file, cb) => {
        // Chỉ cho phép upload ảnh
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file ảnh'));
        }
    }
});

// Upload một ảnh
router.post('/upload', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
        }

        // Tối ưu ảnh với sharp
        const optimizedFileName = 'opt-' + req.file.filename;
        await sharp(req.file.path)
            .resize(800) // Giới hạn kích thước tối đa
            .jpeg({ quality: 80 }) // Nén ảnh với chất lượng 80%
            .toFile(path.join('public/uploads', optimizedFileName));

        // Xóa file gốc
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Upload thành công',
            file: {
                filename: optimizedFileName,
                path: `/uploads/${optimizedFileName}`
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi upload file', error: error.message });
    }
});

// Upload nhiều ảnh
router.post('/upload-multiple', auth, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
        }

        const uploadedFiles = [];

        // Xử lý từng file
        for (const file of req.files) {
            const optimizedFileName = 'opt-' + file.filename;
            await sharp(file.path)
                .resize(800)
                .jpeg({ quality: 80 })
                .toFile(path.join('public/uploads', optimizedFileName));

            // Xóa file gốc
            fs.unlinkSync(file.path);

            uploadedFiles.push({
                filename: optimizedFileName,
                path: `/uploads/${optimizedFileName}`
            });
        }

        res.json({
            message: 'Upload thành công',
            files: uploadedFiles
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi upload files', error: error.message });
    }
});

// Lấy danh sách ảnh
router.get('/list', auth, (req, res) => {
    try {
        const uploadDir = 'public/uploads';
        const files = fs.readdirSync(uploadDir)
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
            })
            .map(file => ({
                filename: file,
                path: `/uploads/${file}`,
                size: fs.statSync(path.join(uploadDir, file)).size,
                uploadedAt: fs.statSync(path.join(uploadDir, file)).mtime
            }));

        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách ảnh', error: error.message });
    }
});

// Xóa ảnh
router.delete('/:filename', auth, (req, res) => {
    try {
        const filePath = path.join('public/uploads', req.params.filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'Xóa file thành công' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy file' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa file', error: error.message });
    }
});

module.exports = router; 