const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        maxLength: 500
    },
    description: {
        type: String,
        trim: true,
        maxLength: 2000
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    featured: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    viewCount: {
        type: Number,
        default: 0
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Tạo index cho tìm kiếm
PostSchema.index({ 
    title: 'text',
    description: 'text',
    content: 'text',
    tags: 'text'
});

// Middleware trước khi lưu
PostSchema.pre('save', function(next) {
    // Tự động tạo slug nếu không có
    if (!this.slug) {
        this.slug = this.title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    
    // Cập nhật lastModified
    this.lastModified = new Date();
    next();
});

module.exports = mongoose.model('Post', PostSchema); 