module.exports = (req, res, next) => {
    // Kiểm tra xem user có role admin không
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Không có quyền truy cập',
            details: 'Chỉ admin mới có quyền thực hiện thao tác này'
        });
    }
    next();
}; 