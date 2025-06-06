const express = require('express');
const router = express.Router();
const multer = require('multer');
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');

// Cấu hình multer để xử lý upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        // Kiểm tra mime type
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Định dạng file không được hỗ trợ'), false);
        }
    }
});

// Routes
router.post('/upload', protect, upload.array('files'), mediaController.upload);
router.get('/', protect, mediaController.getAll);
router.get('/:id', protect, mediaController.getOne);
router.put('/:id', protect, mediaController.update);
router.delete('/:id', protect, mediaController.delete);

module.exports = router; 