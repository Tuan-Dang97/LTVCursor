const http = require('http');

const systemCheck = async () => {
    console.log('🔍 KIỂM TRA TÌNH TRẠNG HỆ THỐNG');
    console.log('=' .repeat(50));
    
    let allGood = true;
    
    // 1. Kiểm tra server có chạy không
    try {
        await checkUrl('http://localhost:3000', 'Node.js Server');
        console.log('✅ Server đang chạy');
    } catch (error) {
        console.log('❌ Server không chạy');
        allGood = false;
    }
    
    // 2. Kiểm tra API Posts
    try {
        const postsData = await checkUrl('http://localhost:3000/api/posts/public?limit=1', 'Posts API');
        const response = JSON.parse(postsData);
        if (response.success && response.data.posts.length > 0) {
            console.log(`✅ Posts API hoạt động (${response.data.pagination.totalItems} bài viết)`);
        } else {
            console.log('⚠️  Posts API hoạt động nhưng không có dữ liệu');
        }
    } catch (error) {
        console.log('❌ Posts API không hoạt động');
        allGood = false;
    }
    
    // 3. Kiểm tra API Categories
    try {
        const categoriesData = await checkUrl('http://localhost:3000/api/categories/public', 'Categories API');
        const response = JSON.parse(categoriesData);
        if (response.success && response.data.length > 0) {
            console.log(`✅ Categories API hoạt động (${response.data.length} danh mục)`);
        } else {
            console.log('⚠️  Categories API hoạt động nhưng không có dữ liệu');
        }
    } catch (error) {
        console.log('❌ Categories API không hoạt động');
        allGood = false;
    }
    
    // 4. Kiểm tra Website frontend
    try {
        const websiteData = await checkUrl('http://localhost:3000', 'Website Frontend');
        if (websiteData.includes('<!DOCTYPE html>')) {
            console.log('✅ Website frontend tải được');
        } else {
            console.log('⚠️  Website frontend có vấn đề');
        }
    } catch (error) {
        console.log('❌ Website frontend không tải được');
        allGood = false;
    }
    
    // 5. Kiểm tra MongoDB (gián tiếp qua database connection)
    try {
        require('dotenv').config();
        const mongoose = require('mongoose');
        await mongoose.connect('mongodb://localhost:27017/ltvlaw');
        
        const Post = require('../models/Post');
        const postCount = await Post.countDocuments();
        
        const Category = require('../models/Category');
        const categoryCount = await Category.countDocuments();
        
        console.log(`✅ MongoDB kết nối được (${postCount} bài viết, ${categoryCount} danh mục)`);
        
        mongoose.connection.close();
    } catch (error) {
        console.log('❌ MongoDB không kết nối được');
        allGood = false;
    }
    
    console.log('=' .repeat(50));
    
    if (allGood) {
        console.log('🎉 TẤT CẢ DỊCH VỤ HOẠT ĐỘNG BÌNH THƯỜNG!');
        console.log('🌐 Website có thể truy cập tại: http://localhost:3000');
        console.log('🔧 Admin panel tại: http://localhost:3000/admin');
    } else {
        console.log('⚠️  CÓ VẤN ĐỀ VỚI HỆ THỐNG!');
        console.log('💡 Hãy kiểm tra các dịch vụ bị lỗi ở trên');
    }
    
    console.log('\n📋 CÁC LỆNH HỮU ÍCH:');
    console.log('   npm run dev          - Khởi động server');
    console.log('   npm run seed-posts   - Tạo dữ liệu mẫu');
    console.log('   npm run check-posts  - Kiểm tra bài viết');
    console.log('   npm run check-system - Kiểm tra hệ thống');
};

// Helper function to check URL
function checkUrl(url, name) {
    return new Promise((resolve, reject) => {
        const timeout = 5000; // 5 seconds timeout
        
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(timeout, () => {
            req.abort();
            reject(new Error('Timeout'));
        });
    });
}

systemCheck(); 