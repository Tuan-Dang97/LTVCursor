const SEO = require('../models/SEO');

// Lấy cấu hình SEO
exports.getSEOConfig = async (req, res) => {
    try {
        const seo = await SEO.getInstance();
        res.json(seo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật cấu hình SEO
exports.updateSEOConfig = async (req, res) => {
    try {
        const seo = await SEO.getInstance();
        
        // Cập nhật các trường cơ bản
        const basicFields = [
            'siteName',
            'defaultTitle',
            'defaultDescription',
            'defaultKeywords',
            'favicon',
            'logo',
            'socialImage',
            'googleAnalyticsId',
            'facebookPixelId',
            'facebookAppId',
            'robots',
            'canonicalUrl'
        ];

        basicFields.forEach(field => {
            if (req.body[field] !== undefined) {
                seo[field] = req.body[field];
            }
        });

        // Cập nhật thông tin tổ chức
        if (req.body.organization) {
            seo.structuredData.organization = {
                ...seo.structuredData.organization,
                ...req.body.organization
            };
        }

        // Cập nhật cấu hình breadcrumb
        if (req.body.breadcrumb !== undefined) {
            seo.structuredData.breadcrumb = {
                ...seo.structuredData.breadcrumb,
                enabled: req.body.breadcrumb
            };
        }

        // Cập nhật custom meta tags
        if (req.body.customMetaTags) {
            seo.customMetaTags = req.body.customMetaTags;
        }

        await seo.save();
        res.json(seo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo meta tags cho một trang cụ thể
exports.generateMetaTags = async (req, res) => {
    try {
        const seo = await SEO.getInstance();
        const metaTags = seo.generateMetaTags(req.body);
        res.json(metaTags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo structured data cho một trang cụ thể
exports.generateStructuredData = async (req, res) => {
    try {
        const seo = await SEO.getInstance();
        const structuredData = seo.generateStructuredData(req.body);
        res.json(structuredData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Middleware để thêm SEO vào response
exports.injectSEO = async (req, res, next) => {
    try {
        const seo = await SEO.getInstance();
        
        // Tạo dữ liệu SEO dựa trên route hiện tại
        const seoData = {
            url: `${seo.canonicalUrl}${req.originalUrl}`,
            type: req.originalUrl === '/' ? 'website' : 'article'
        };

        // Thêm breadcrumb nếu có
        if (req.breadcrumb) {
            seoData.breadcrumb = req.breadcrumb;
        }

        // Thêm meta tags và structured data vào res.locals
        res.locals.metaTags = seo.generateMetaTags(seoData);
        res.locals.structuredData = seo.generateStructuredData(seoData);
        
        // Thêm tracking IDs
        res.locals.googleAnalyticsId = seo.googleAnalyticsId;
        res.locals.facebookPixelId = seo.facebookPixelId;

        next();
    } catch (error) {
        next(error);
    }
}; 