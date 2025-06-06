~require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function createAdminUser() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ltv_law');
        
        // Kiểm tra xem đã có admin chưa
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Tạo admin user
        const adminUser = new User({
            username: 'admin',
            email: 'admin@ltvlaw.com',
            password: 'Admin@123',
            fullName: 'Admin LTV',
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@ltvlaw.com');
        console.log('Password: Admin@123');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createAdminUser(); 