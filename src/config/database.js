const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const connectDB = async () => {
    try {
        // Thử kết nối MongoDB - Loại bỏ các option deprecated
        const conn = await mongoose.connect('mongodb://localhost:27017/ltvlaw', {
            serverSelectionTimeoutMS: 5000 // Timeout sau 5 giây nếu không kết nối được
        });
        
        console.log('MongoDB Connected');

        // Kiểm tra và tạo/cập nhật tài khoản admin
        try {
            const adminExists = await User.findOne({ role: 'admin' });
            if (!adminExists) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('Admin@123', salt);
                
                const admin = new User({
                    username: 'admin',
                    email: 'admin@ltvlaw.com',
                    password: hashedPassword,
                    fullName: 'Admin LTV',
                    role: 'admin'
                });
                
                await admin.save();
                console.log('Tài khoản admin đã được tạo');
            }
        } catch (adminError) {
            console.error('Lỗi khi tạo tài khoản admin:', adminError);
        }

    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);
        // Thử kết nối lại sau 5 giây
        setTimeout(connectDB, 5000);
    }
};

// Xử lý các sự kiện của MongoDB
mongoose.connection.on('error', err => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    // Thử kết nối lại sau 5 giây
    setTimeout(connectDB, 5000);
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = connectDB; 