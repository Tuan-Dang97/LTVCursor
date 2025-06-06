const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Category = require('../models/Category');
const connectDB = require('../config/database');

// Dữ liệu admin mặc định
const adminData = {
    username: 'admin',
    email: 'admin@ltvlaw.vn',
    fullName: 'LTV Law Administrator',
    password: 'Admin@123456',
    role: 'admin'
};

// Dữ liệu categories mặc định
const defaultCategories = [
    {
        name: 'Pháp luật doanh nghiệp',
        slug: 'phap-luat-doanh-nghiep',
        description: 'Các vấn đề pháp lý liên quan đến doanh nghiệp',
        order: 1
    },
    {
        name: 'Sở hữu trí tuệ',
        slug: 'so-huu-tri-tue', 
        description: 'Bảo hộ quyền sở hữu trí tuệ, thương hiệu, bằng sáng chế',
        order: 2
    },
    {
        name: 'Tư vấn đầu tư',
        slug: 'tu-van-dau-tu',
        description: 'Tư vấn pháp lý cho các hoạt động đầu tư',
        order: 3
    },
    {
        name: 'Luật lao động',
        slug: 'luat-lao-dong',
        description: 'Các quy định về hợp đồng lao động, quyền lợi người lao động',
        order: 4
    },
    {
        name: 'Luật thuế',
        slug: 'luat-thue',
        description: 'Các quy định về thuế, khai báo thuế cho doanh nghiệp',
        order: 5
    }
];

async function createAdminUser() {
    try {
        // Kết nối database
        await connectDB();
        console.log('✅ Đã kết nối MongoDB');

        // Kiểm tra admin đã tồn tại
        const existingAdmin = await User.findOne({
            $or: [
                { email: adminData.email },
                { username: adminData.username },
                { role: 'admin' }
            ]
        });

        if (existingAdmin) {
            console.log('⚠️ User admin đã tồn tại:', existingAdmin.email);
            console.log('📧 Email:', existingAdmin.email);
            console.log('👤 Username:', existingAdmin.username);
            console.log('🔑 Role:', existingAdmin.role);
            return;
        }

        // Tạo admin user mới
        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        
        const admin = new User({
            username: adminData.username,
            email: adminData.email,
            fullName: adminData.fullName,
            password: hashedPassword,
            role: adminData.role,
            isActive: true
        });

        await admin.save();
        console.log('🎉 Đã tạo admin user thành công!');
        console.log('📧 Email:', adminData.email);
        console.log('👤 Username:', adminData.username);
        console.log('🔑 Password:', adminData.password);
        console.log('⚠️ LƯU Ý: Đổi mật khẩu sau khi đăng nhập lần đầu!');

    } catch (error) {
        console.error('❌ Lỗi khi tạo admin user:', error.message);
        throw error;
    }
}

async function createDefaultCategories() {
    try {
        console.log('📂 Tạo danh mục mặc định...');

        for (const categoryData of defaultCategories) {
            const existingCategory = await Category.findOne({
                $or: [
                    { name: categoryData.name },
                    { slug: categoryData.slug }
                ]
            });

            if (existingCategory) {
                console.log(`⚠️ Danh mục "${categoryData.name}" đã tồn tại`);
                continue;
            }

            const category = new Category(categoryData);
            await category.save();
            console.log(`✅ Đã tạo danh mục: ${categoryData.name}`);
        }

        console.log('🎉 Hoàn thành tạo danh mục mặc định!');

    } catch (error) {
        console.error('❌ Lỗi khi tạo danh mục:', error.message);
        throw error;
    }
}

async function setupDatabase() {
    try {
        console.log('🚀 Bắt đầu khởi tạo database...');
        
        await createAdminUser();
        await createDefaultCategories();
        
        console.log('🎉 Khởi tạo database hoàn tất!');
        console.log('');
        console.log('📋 THÔNG TIN ĐĂNG NHẬP ADMIN:');
        console.log(`📧 Email: ${adminData.email}`);
        console.log(`👤 Username: ${adminData.username}`);
        console.log(`🔑 Password: ${adminData.password}`);
        console.log('');
        console.log('🌐 Truy cập admin panel: http://localhost:3000/admin');
        
        process.exit(0);
        
    } catch (error) {
        console.error('💥 Lỗi khởi tạo:', error);
        process.exit(1);
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    setupDatabase();
}

module.exports = {
    createAdminUser,
    createDefaultCategories,
    setupDatabase
}; 