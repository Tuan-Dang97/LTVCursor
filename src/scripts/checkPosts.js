require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');

const checkPosts = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/ltvlaw');
        console.log('MongoDB Connected\n');

        // Lấy tất cả categories
        const categories = await Category.find().sort({ name: 1 });
        
        console.log('📊 THỐNG KÊ BÁI VIẾT THEO DANH MỤC:');
        console.log('=' .repeat(50));
        
        let totalPosts = 0;
        
        for (const category of categories) {
            const count = await Post.countDocuments({ categories: category._id });
            totalPosts += count;
            
            // Hiển thị thống kê
            const status = count >= 6 ? '✅' : count >= 3 ? '⚠️ ' : '❌';
            console.log(`${status} ${category.name}: ${count} bài viết`);
            
            // Hiển thị 3 bài viết đầu tiên của category
            const posts = await Post.find({ categories: category._id })
                .select('title viewCount')
                .sort({ createdAt: -1 })
                .limit(3);
                
            posts.forEach((post, index) => {
                console.log(`   ${index + 1}. ${post.title} (${post.viewCount} lượt xem)`);
            });
            
            if (count > 3) {
                console.log(`   ... và ${count - 3} bài viết khác\n`);
            } else {
                console.log('');
            }
        }
        
        console.log('=' .repeat(50));
        console.log(`📈 TỔNG CỘNG: ${totalPosts} bài viết`);
        console.log(`📂 SỐ DANH MỤC: ${categories.length} danh mục`);
        console.log(`📊 TRUNG BÌNH: ${Math.round(totalPosts / categories.length)} bài/danh mục\n`);
        
        // Kiểm tra bài viết nổi bật
        const featuredPosts = await Post.countDocuments({ featured: true });
        console.log(`⭐ BÁI VIẾT NỔI BẬT: ${featuredPosts} bài`);
        
        // Kiểm tra bài viết xem nhiều nhất
        const mostViewed = await Post.findOne().sort({ viewCount: -1 }).select('title viewCount');
        if (mostViewed) {
            console.log(`👀 XEM NHIỀU NHẤT: "${mostViewed.title}" (${mostViewed.viewCount} lượt xem)`);
        }
        
        mongoose.connection.close();
        console.log('\n✅ Kiểm tra hoàn tất!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

checkPosts(); 