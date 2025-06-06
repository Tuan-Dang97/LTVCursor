const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');

// Middleware xác thực JWT
const auth = async (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Không có token xác thực',
                details: 'Vui lòng đăng nhập để tiếp tục'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Tìm user
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Không tìm thấy người dùng',
                details: 'Token không hợp lệ'
            });
        }

        // Thêm thông tin user vào request
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ 
            error: 'Token không hợp lệ',
            details: err.message 
        });
    }
};

// Middleware kiểm tra role admin
const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập' });
    }
};

// Middleware kiểm tra role editor hoặc admin
const editorAuth = (req, res, next) => {
    if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập' });
    }
};

module.exports = {
    auth,
    adminAuth,
    editorAuth
}; 