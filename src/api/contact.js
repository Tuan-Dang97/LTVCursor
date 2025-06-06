const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API endpoint xử lý form liên hệ
router.post('/api/contact', async (req, res) => {
    try {
        const { fullname, phone, email, service, message } = req.body;

        // Validate dữ liệu
        if (!fullname || !phone || !service) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
            });
        }

        // Gửi email thông báo
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `Yêu cầu tư vấn mới từ ${fullname}`,
            html: `
                <h3>Thông tin khách hàng:</h3>
                <p><strong>Họ tên:</strong> ${fullname}</p>
                <p><strong>Số điện thoại:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email || 'Không có'}</p>
                <p><strong>Dịch vụ:</strong> ${service}</p>
                <p><strong>Nội dung:</strong> ${message || 'Không có'}</p>
            `
        });

        // Lưu vào database (có thể thêm sau)

        res.status(200).json({ 
            success: true, 
            message: 'Yêu cầu của bạn đã được gửi thành công' 
        });

    } catch (error) {
        console.error('Lỗi khi xử lý form liên hệ:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Có lỗi xảy ra, vui lòng thử lại sau' 
        });
    }
});

module.exports = router; 