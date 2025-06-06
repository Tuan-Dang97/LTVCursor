const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ route yêu cầu đăng nhập
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // Kiểm tra header Authorization
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            
            // Tìm user từ token
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Token không hợp lệ'
                });
            }

            // Thêm user vào request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Middleware kiểm tra role admin
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập. Chỉ admin mới được phép.'
        });
    }
};

// Middleware kiểm tra role editor hoặc admin
exports.editor = (req, res, next) => {
    if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập. Chỉ editor hoặc admin mới được phép.'
        });
    }
}; 