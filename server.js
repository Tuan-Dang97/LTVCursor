require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/default');
const connectDB = require('./src/config/database');
const generateSitemap = require('./src/utils/generateSitemap');

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Thêm middleware để xử lý preflight requests
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Quá nhiều request từ IP của bạn, vui lòng thử lại sau 15 phút'
});

// Development-only: Reset rate limit endpoint
if (config.server.env === 'development') {
    app.get('/dev/reset-limit', (req, res) => {
        limiter.resetKey(req.ip);
        res.json({ success: true, message: 'Rate limit reset thành công' });
    });
}

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Áp dụng rate limiting cho tất cả requests
app.use(limiter);

// Kết nối database
connectDB();

// Middleware
app.use(bodyParser.json({ limit: config.upload.maxFileSize }));

// Static files - MUST be before API routes
// Admin static files FIRST (highest priority)
app.use('/admin/styles', express.static(path.join(__dirname, 'src/admin/styles'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));

app.use('/admin/js', express.static(path.join(__dirname, 'src/admin/js')));

// General admin static files
app.use('/admin', express.static(path.join(__dirname, 'src/admin'), {
    index: false, // Don't serve index.html automatically
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));

// Public static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// Serve built assets from dist folder (for frontend CSS/JS)
app.use('/assets', express.static(path.join(__dirname, 'dist/assets')));
app.use('/image', express.static(path.join(__dirname, 'dist/image')));

// Serve assets with project name prefix (from Vite build)
app.use('/LTVLaw-12-5-2025/assets', express.static(path.join(__dirname, 'dist/assets')));

// Serve CSS from src folder for relative path references
app.use('/css', express.static(path.join(__dirname, 'src/css/layout')));

// Routes
// API routes
app.use('/api/posts', require('./src/api/posts'));
app.use('/api/users', require('./src/api/users'));
app.use('/api/categories', require('./src/api/categories'));
app.use('/api/upload', require('./src/api/upload'));
app.use('/api/dashboard', require('./src/api/dashboard'));
app.use('/api/seo', require('./src/routes/seoRoutes'));
app.use('/api/media', require('./src/routes/mediaRoutes'));
app.use('/api/contact', require('./src/api/contact'));

// Sitemap route
app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://ltvlaw.vn' 
            : 'http://localhost:3000';
            
        const sitemap = await generateSitemap(baseUrl);
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Admin home page
app.get('/admin', (req, res) => {
    // Always serve index.html - let JS handle auth
    res.sendFile(path.join(__dirname, 'src/admin/index.html'));
});

// Admin login page
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/admin/login.html'));
});

app.use(express.static(path.join(__dirname, 'dist'), {
    maxAge: '1d',
    etag: true
}));

// Frontend catch-all route - phải đặt cuối cùng
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use(require('./src/middleware/errorHandler'));

// Start server với xử lý lỗi port
const startServer = (port = config.server.port) => {
    // Ensure port is a number and within valid range
    const portNum = parseInt(port);
    if (portNum >= 65535) {
        console.error('Cannot find available port. Please check your system.');
        process.exit(1);
    }
    
    const server = app.listen(portNum, () => {
        console.log(`Server đang chạy tại http://localhost:${portNum} (${config.server.env})`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${portNum} đang được sử dụng, thử port ${portNum + 1}...`);
            startServer(portNum + 1);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
            process.exit(0);
        });
    });
    
    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
            process.exit(0);
        });
    });
};

startServer(); 