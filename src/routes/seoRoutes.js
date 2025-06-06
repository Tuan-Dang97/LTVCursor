const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes cho admin
router.get('/config', protect, admin, async (req, res) => {
    try {
        // TODO: Implement SEO config retrieval
        res.json({
            title: 'LTV Law - Tư vấn pháp luật',
            description: 'Công ty Luật TNHH LTV - Chuyên cung cấp dịch vụ tư vấn pháp luật',
            keywords: 'luật, tư vấn luật, dịch vụ pháp lý',
            ogImage: '/images/logo.png',
            googleAnalyticsId: process.env.GA_TRACKING_ID
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

router.put('/config', protect, admin, async (req, res) => {
    try {
        const { title, description, keywords, ogImage } = req.body;
        
        // TODO: Implement SEO config update
        res.json({
            message: 'Cập nhật cấu hình SEO thành công',
            config: { title, description, keywords, ogImage }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Routes cho frontend
router.post('/meta-tags', seoController.generateMetaTags);
router.post('/structured-data', seoController.generateStructuredData);

module.exports = router; 