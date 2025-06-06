const Media = require('../models/Media');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Cấu hình thư mục upload
const UPLOAD_DIR = 'uploads';
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Đảm bảo thư mục upload tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Xử lý upload file
exports.upload = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Không có file nào được tải lên' });
        }

        const results = [];
        const errors = [];

        for (const file of req.files) {
            try {
                // Kiểm tra kích thước
                if (file.size > MAX_FILE_SIZE) {
                    errors.push(`File ${file.originalname} vượt quá kích thước cho phép`);
                    continue;
                }

                // Tạo tên file mới
                const ext = path.extname(file.originalname);
                const newFileName = `${uuidv4()}${ext}`;
                const filePath = path.join(UPLOAD_DIR, newFileName);

                // Xử lý ảnh nếu là file ảnh
                if (IMAGE_TYPES.includes(file.mimetype)) {
                    const image = sharp(file.buffer);
                    const metadata = await image.metadata();

                    // Tối ưu ảnh
                    await image
                        .resize(2000, 2000, { 
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .jpeg({ quality: 80 })
                        .toFile(filePath);

                    // Lưu thông tin vào database
                    const media = await Media.create({
                        name: path.parse(file.originalname).name,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        url: `/uploads/${newFileName}`,
                        path: filePath,
                        type: 'image',
                        dimensions: {
                            width: metadata.width,
                            height: metadata.height
                        },
                        uploadedBy: req.user._id
                    });

                    results.push(media.getBasicInfo());
                } else {
                    // Xử lý file thông thường
                    fs.writeFileSync(filePath, file.buffer);

                    const media = await Media.create({
                        name: path.parse(file.originalname).name,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        url: `/uploads/${newFileName}`,
                        path: filePath,
                        type: 'document',
                        uploadedBy: req.user._id
                    });

                    results.push(media.getBasicInfo());
                }
            } catch (error) {
                errors.push(`Lỗi khi xử lý file ${file.originalname}: ${error.message}`);
            }
        }

        res.json({
            success: results.length > 0,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách media
exports.getAll = async (req, res) => {
    try {
        const media = await Media.search(req.query);
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy chi tiết media
exports.getOne = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id).select('-path');
        if (!media) {
            return res.status(404).json({ message: 'Không tìm thấy file' });
        }
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thông tin media
exports.update = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Không tìm thấy file' });
        }

        // Chỉ cho phép cập nhật một số trường
        const allowedUpdates = ['name', 'alt'];
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        Object.assign(media, updates);
        await media.save();

        res.json(media.getBasicInfo());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa media
exports.delete = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Không tìm thấy file' });
        }

        await media.remove(); // Trigger middleware xóa file
        res.json({ message: 'Đã xóa file thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 