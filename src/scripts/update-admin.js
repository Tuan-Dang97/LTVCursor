require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function updateAdmin() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Tìm user admin bằng email hiện tại
        const admin = await User.findOne({ email: 'admin@ltvlaw.com' });
        if (!admin) {
            console.log('Không tìm thấy tài khoản admin');
            return;
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('jhcl45ho', salt);

        // Cập nhật thông tin
        admin.username = 'jonicage6';
        admin.email = 'jonicage6@gmail.com'; // Thêm email mới
        admin.password = hashedPassword;
        
        await admin.save();
        console.log('Đã cập nhật thông tin admin thành công:');
        console.log('Username:', admin.username);
        console.log('Email:', admin.email);
        console.log('Password: jhcl45ho');

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Đã ngắt kết nối MongoDB');
    }
}

updateAdmin(); 