const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { auth, editorAuth } = require('../middleware/auth');

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/thumbnails');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh!'));
    }
});

// Lấy danh sách bài viết (cho admin)
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username fullName')
            .populate('categories', 'name')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải danh sách bài viết',
            error: error.message
        });
    }
});

// API public để frontend lấy posts (không cần auth)
router.get('/public', async (req, res) => {
    try {
        const { 
            category,
            limit = 10,
            page = 1,
            sort = 'newest',
            featured = false
        } = req.query;

        // Build query
        let query = {};
        
        if (category) {
            query.categories = category;
        }

        if (featured === 'true') {
            query.featured = true;
        }

        // Build sort
        let sortOptions = {};
        switch(sort) {
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'popular':
                sortOptions = { viewCount: -1 };
                break;
            case 'trending':
                sortOptions = { viewCount: -1, createdAt: -1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get posts
        const posts = await Post.find(query)
            .populate('author', 'fullName')
            .populate('categories', 'name slug')
            .select('title content description thumbnail tags viewCount createdAt publishDate author categories slug')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Get total count for pagination
        const total = await Post.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        // Format response
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            description: post.description,
            excerpt: post.description || (post.content ? post.content.substring(0, 150) + '...' : ''),
            image: post.thumbnail || '/img/default-post.jpg',
            link: `/post/${post.slug || post._id}`,
            date: new Date(post.publishDate || post.createdAt).toLocaleDateString('vi-VN'),
            author: post.author?.fullName || 'LTV Law',
            categories: post.categories || [],
            views: post.viewCount || 0,
            tags: post.tags || []
        }));

        res.json({
            success: true,
            data: {
                posts: formattedPosts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                meta: {
                    category,
                    sort,
                    featured
                }
            }
        });

    } catch (error) {
        console.error('Error getting public posts:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải danh sách bài viết',
            error: error.message
        });
    }
});

// API lấy bài viết chi tiết (public)
router.get('/public/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Find by slug or ID
        let post = await Post.findOne({ 
            $or: [{ slug }, { _id: slug }]
        })
        .populate('author', 'fullName')
        .populate('categories', 'name slug')
        .lean();

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        // Increment view count
        await Post.updateOne(
            { _id: post._id },
            { $inc: { viewCount: 1 } }
        );

        // Get related posts (same category)
        const relatedPosts = await Post.find({
            _id: { $ne: post._id },
            categories: { $in: post.categories.map(cat => cat._id) }
        })
        .populate('categories', 'name')
        .select('title thumbnail slug createdAt')
        .limit(4)
        .lean();

        // Format response
        const formattedPost = {
            _id: post._id,
            title: post.title,
            content: post.content,
            description: post.description,
            image: post.thumbnail,
            author: post.author?.fullName || 'LTV Law',
            publishDate: post.publishDate || post.createdAt,
            categories: post.categories,
            tags: post.tags || [],
            views: (post.viewCount || 0) + 1,
            relatedPosts: relatedPosts.map(p => ({
                title: p.title,
                image: p.thumbnail,
                link: `/post/${p.slug || p._id}`,
                date: new Date(p.createdAt).toLocaleDateString('vi-VN')
            }))
        };

        res.json({
            success: true,
            data: formattedPost
        });

    } catch (error) {
        console.error('Error getting post detail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải chi tiết bài viết',
            error: error.message
        });
    }
});

// Lấy chi tiết bài viết
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username fullName')
            .populate('categories', 'name');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        res.json(post);
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải thông tin bài viết',
            error: error.message
        });
    }
});

// Tạo bài viết mới
router.post('/', [auth, editorAuth, upload.single('thumbnail')], async (req, res) => {
    try {
        const { title, description, content, categories, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và nội dung là bắt buộc'
            });
        }

        // Tạo post mới
        const post = new Post({
            title,
            description,
            content,
            author: req.user._id
        });

        // Thêm các trường không bắt buộc nếu có
        if (req.file) {
            post.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
        }
        
        if (categories) {
            post.categories = JSON.parse(categories);
        }
        
        if (tags) {
            post.tags = JSON.parse(tags);
        }

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'username fullName')
            .populate('categories', 'name');

        res.status(201).json({
            success: true,
            message: 'Tạo bài viết thành công',
            post: populatedPost
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo bài viết',
            error: error.message
        });
    }
});

// Cập nhật bài viết
router.put('/:id', [auth, editorAuth, upload.single('thumbnail')], async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        // Kiểm tra quyền
        if (post.author && post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền chỉnh sửa bài viết này'
            });
        }

        const { title, description, content, categories, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và nội dung là bắt buộc'
            });
        }

        // Cập nhật thông tin cơ bản
        const updateData = {
            title,
            content
        };

        // Cập nhật các trường không bắt buộc nếu có
        if (description) updateData.description = description;
        if (req.file) updateData.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
        if (categories) updateData.categories = JSON.parse(categories);
        if (tags) updateData.tags = JSON.parse(tags);

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
        .populate('author', 'username fullName')
        .populate('categories', 'name');

        res.json({
            success: true,
            message: 'Cập nhật bài viết thành công',
            post: updatedPost
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật bài viết',
            error: error.message
        });
    }
});

// Xóa bài viết
router.delete('/:id', [auth, editorAuth], async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        // Kiểm tra quyền
        if (post.author && post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa bài viết này'
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Xóa bài viết thành công'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa bài viết',
            error: error.message
        });
    }
});

module.exports = router; 