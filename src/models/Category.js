const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    order: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    meta: {
        title: String,
        description: String,
        keywords: [String]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Tạo index cho tìm kiếm
CategorySchema.index({ name: 'text' });

// Virtual field cho đường dẫn đầy đủ
CategorySchema.virtual('path').get(function() {
    return this.parent ? `${this.parent.path}/${this.slug}` : this.slug;
});

// Virtual field cho số lượng bài viết
CategorySchema.virtual('postCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'categories',
    count: true
});

// Middleware trước khi xóa
CategorySchema.pre('remove', async function(next) {
    // Kiểm tra xem có danh mục con không
    const childrenCount = await this.model('Category').countDocuments({ parent: this._id });
    if (childrenCount > 0) {
        next(new Error('Không thể xóa danh mục có chứa danh mục con'));
    }
    next();
});

// Method lấy đường dẫn đầy đủ của danh mục
CategorySchema.methods.getFullPath = async function() {
    let path = [this.slug];
    let currentCategory = this;

    while (currentCategory.parent) {
        currentCategory = await this.model('Category').findById(currentCategory.parent);
        if (currentCategory) {
            path.unshift(currentCategory.slug);
        } else {
            break;
        }
    }

    return path.join('/');
};

// Method lấy tất cả danh mục con
CategorySchema.methods.getAllChildren = async function() {
    const children = await this.model('Category').find({ parent: this._id });
    let allChildren = [...children];

    for (const child of children) {
        const grandChildren = await child.getAllChildren();
        allChildren = allChildren.concat(grandChildren);
    }

    return allChildren;
};

// Static method lấy cây danh mục
CategorySchema.statics.getTree = async function() {
    const categories = await this.find().sort('order');
    const tree = [];
    const map = {};

    // Tạo map các danh mục
    categories.forEach(cat => {
        map[cat._id] = {
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            order: cat.order,
            children: []
        };
    });

    // Xây dựng cây
    categories.forEach(cat => {
        if (cat.parent) {
            map[cat.parent].children.push(map[cat._id]);
        } else {
            tree.push(map[cat._id]);
        }
    });

    return tree;
};

module.exports = mongoose.model('Category', CategorySchema); 