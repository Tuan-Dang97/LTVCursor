module.exports = {
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ltv_law'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    },
    upload: {
        path: process.env.UPLOAD_PATH || 'uploads',
        maxFileSize: 5 * 1024 * 1024 // 5MB
    },
    analytics: {
        gaTrackingId: process.env.GA_TRACKING_ID
    },
    facebook: {
        appId: process.env.FB_APP_ID,
        pixelId: process.env.FB_PIXEL_ID
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.NODE_ENV === 'production' ? 100 : 1000 // 1000 requests for dev, 100 for production
    },
    security: {
        cors: {
            allowedOrigins: process.env.NODE_ENV === 'production' 
                ? ['https://ltvlaw.vn', 'https://admin.ltvlaw.vn']
                : ['http://localhost:3000'],
            credentials: true
        },
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google-analytics.com'],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    connectSrc: ["'self'", 'https://www.google-analytics.com']
                }
            }
        }
    },
    cache: {
        static: {
            maxAge: '1d',
            etag: true
        },
        api: {
            duration: 300, // 5 minutes
            staleWhileRevalidate: 60 // 1 minute
        }
    }
}; 