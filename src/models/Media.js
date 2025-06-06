const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên file là bắt buộc'],
        trim: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    alt: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['image', 'document'],
        required: true
    },
    dimensions: {
        width: Number,
        height: Number
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Middleware trước khi xóa để xóa file vật lý
mediaSchema.pre('remove', async function(next) {
    try {
        const fs = require('fs');
        if (fs.existsSync(this.path)) {
            fs.unlinkSync(this.path);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Method kiểm tra file có phải là ảnh
mediaSchema.methods.isImage = function() {
    return this.type === 'image';
};

// Method lấy đường dẫn tương đối
mediaSchema.methods.getRelativePath = function() {
    return this.path.replace(process.cwd(), '');
};

// Method lấy thông tin cơ bản
mediaSchema.methods.getBasicInfo = function() {
    return {
        id: this._id,
        name: this.name,
        url: this.url,
        type: this.type,
        size: this.size,
        dimensions: this.dimensions
    };
};

// Static method tìm kiếm media
mediaSchema.statics.search = async function(params) {
    const query = {};
    
    if (params.search) {
        query.$or = [
            { name: new RegExp(params.search, 'i') },
            { originalName: new RegExp(params.search, 'i') }
        ];
    }
    
    if (params.type) {
        query.type = params.type;
    }

    let sort = { createdAt: -1 }; // Mặc định sắp xếp theo thời gian tạo mới nhất
    
    switch (params.sort) {
        case 'oldest':
            sort = { createdAt: 1 };
            break;
        case 'name':
            sort = { name: 1 };
            break;
        case 'size':
            sort = { size: -1 };
            break;
    }

    return this.find(query)
        .sort(sort)
        .select('-path') // Không trả về đường dẫn vật lý
        .lean();
};

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media; 