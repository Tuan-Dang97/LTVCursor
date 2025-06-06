const express = require('express');
const router = express.Router();
const { auth, editorAuth } = require('../middleware/auth');
const Category = require('../models/Category');
const slugify = require('slugify');
const Post = require('../models/Post');
const { check, validationResult } = require('express-validator');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải danh sách danh mục',
            error: error.message
        });
    }
});

// API public để frontend lấy categories (không cần auth) - PHẢI ĐẶT TRƯỚC /:id
router.get('/public', async (req, res) => {
    try {
        const { withCount = false } = req.query;

        let categories;
        
        if (withCount === 'true') {
            // Lấy danh mục kèm số lượng bài viết
            categories = await Category.aggregate([
                {
                    $lookup: {
                        from: 'posts',
                        localField: '_id',
                        foreignField: 'categories',
                        as: 'posts',
                        pipeline: [
                            { $match: { status: 'published' } }
                        ]
                    }
                },
                {
                    $addFields: {
                        postCount: { $size: '$posts' }
                    }
                },
                {
                    $project: {
                        posts: 0 // Loại bỏ field posts khỏi kết quả
                    }
                },
                {
                    $sort: { order: 1, name: 1 }
                }
            ]);
        } else {
            // Chỉ lấy thông tin danh mục
            categories = await Category.find()
                .select('name slug description order')
                .sort({ order: 1, name: 1 })
                .lean();
        }

        // Format response
        const formattedCategories = categories.map(category => ({
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            order: category.order,
            link: `/category/${category.slug || category._id}`,
            postCount: category.postCount || 0
        }));

        res.json({
            success: true,
            data: formattedCategories
        });

    } catch (error) {
        console.error('Error getting public categories:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải danh sách danh mục',
            error: error.message
        });
    }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }
        res.json(category);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (Admin only)
router.post('/', [auth, editorAuth], async (req, res) => {
    try {
        const { name, description, order } = req.body;

        // Tạo slug từ tên
        const slug = name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        const category = new Category({
            name,
            slug,
            description,
            order: order || 0
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo danh mục',
            error: error.message
        });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin only)
router.put('/:id', [auth, editorAuth], async (req, res) => {
    try {
        const { name, description, order } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        // Cập nhật thông tin
        if (name) {
            category.name = name;
            category.slug = name.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        }
        if (description !== undefined) category.description = description;
        if (order !== undefined) category.order = order;

        await category.save();

        res.json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật danh mục',
            error: error.message
        });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
router.delete('/:id', [auth, editorAuth], async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        await category.remove();

        res.json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa danh mục',
            error: error.message
        });
    }
});

// Sắp xếp lại thứ tự danh mục
router.post('/reorder', [auth, editorAuth], async (req, res) => {
    try {
        const { orders } = req.body;

        // orders là một mảng object { id: categoryId, order: newOrder }
        for (const item of orders) {
            await Category.findByIdAndUpdate(item.id, { order: item.order });
        }

        res.json({ message: 'Cập nhật thứ tự thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thứ tự', error: error.message });
    }
});

module.exports = router; 