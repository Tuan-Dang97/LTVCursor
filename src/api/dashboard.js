const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Category = require('../models/Category');

// Lấy thống kê tổng quan cho dashboard
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        // Tổng số bài viết
        const totalPosts = await Post.countDocuments();

        // Số bài viết trong tháng
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyPosts = await Post.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Tổng lượt xem
        const viewsResult = await Post.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$viewCount' }
                }
            }
        ]);
        const totalViews = viewsResult[0]?.totalViews || 0;

        // Tổng số người dùng
        const totalUsers = await User.countDocuments();

        // Bài viết mới nhất (5 bài)
        const recentPosts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('author', 'username fullName')
            .populate('categories', 'name')
            .select('title createdAt author categories viewCount');

        // Thống kê theo danh mục
        const categoryStats = await Post.aggregate([
            { $unwind: '$categories' },
            { 
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$categoryInfo._id',
                    name: { $first: '$categoryInfo.name' },
                    count: { $sum: 1 },
                    totalViews: { $sum: '$viewCount' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Thống kê lượt xem theo ngày (7 ngày gần nhất)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const dailyViews = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    views: { $sum: '$viewCount' },
                    posts: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Top bài viết được xem nhiều nhất
        const topPosts = await Post.find()
            .sort({ viewCount: -1 })
            .limit(5)
            .populate('author', 'fullName')
            .select('title viewCount createdAt author');

        // Thống kê người dùng mới trong tháng
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Tổng số danh mục
        const totalCategories = await Category.countDocuments();

        res.json({
            success: true,
            data: {
                // Số liệu tổng quan
                totalPosts,
                monthlyPosts,
                totalViews,
                totalUsers,
                totalCategories,
                newUsersThisMonth,
                
                // Dữ liệu chi tiết
                recentPosts,
                categoryStats,
                dailyViews,
                topPosts,
                
                // Tỷ lệ phần trăm tăng trương (so với tháng trước)
                growth: {
                    posts: monthlyPosts > 0 ? ((monthlyPosts / Math.max(totalPosts - monthlyPosts, 1)) * 100).toFixed(1) : 0,
                    users: newUsersThisMonth > 0 ? ((newUsersThisMonth / Math.max(totalUsers - newUsersThisMonth, 1)) * 100).toFixed(1) : 0
                }
            }
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải dữ liệu dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// API lấy thống kê chi tiết cho charts
router.get('/analytics', [auth, adminAuth], async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        let startDate = new Date();
        let groupFormat = {};
        
        switch(period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                break;
            case '6m':
                startDate.setMonth(startDate.getMonth() - 6);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                groupFormat = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
                break;
        }

        // Thống kê bài viết theo thời gian
        const postStats = await Post.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: groupFormat,
                    count: { $sum: 1 },
                    views: { $sum: '$viewCount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Thống kê người dùng theo thời gian
        const userStats = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: groupFormat,
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                period,
                startDate,
                postStats,
                userStats
            }
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải dữ liệu analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router; 