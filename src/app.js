const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const postsRouter = require('./api/posts');
const usersRouter = require('./api/users');
const categoriesRouter = require('./api/categories');
const uploadRouter = require('./api/upload');

const app = express();

// Kết nối database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/upload', uploadRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 