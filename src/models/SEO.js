const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: [true, 'Tên website là bắt buộc'],
        trim: true
    },
    defaultTitle: {
        type: String,
        required: [true, 'Title mặc định là bắt buộc'],
        trim: true
    },
    defaultDescription: {
        type: String,
        required: [true, 'Description mặc định là bắt buộc'],
        trim: true,
        maxLength: [160, 'Description không được quá 160 ký tự']
    },
    defaultKeywords: [{
        type: String,
        trim: true
    }],
    favicon: {
        type: String,
        default: '/favicon.ico'
    },
    logo: {
        type: String,
        required: [true, 'Logo là bắt buộc']
    },
    socialImage: {
        type: String,
        required: [true, 'Ảnh chia sẻ mạng xã hội là bắt buộc']
    },
    googleAnalyticsId: {
        type: String,
        trim: true
    },
    facebookPixelId: {
        type: String,
        trim: true
    },
    facebookAppId: {
        type: String,
        trim: true
    },
    robots: {
        type: String,
        enum: ['index,follow', 'noindex,nofollow', 'index,nofollow', 'noindex,follow'],
        default: 'index,follow'
    },
    canonicalUrl: {
        type: String,
        trim: true
    },
    structuredData: {
        organization: {
            name: String,
            logo: String,
            address: String,
            phone: String,
            email: String,
            socialLinks: [{
                platform: String,
                url: String
            }]
        },
        breadcrumb: {
            enabled: {
                type: Boolean,
                default: true
            }
        }
    },
    customMetaTags: [{
        name: String,
        content: String
    }]
}, {
    timestamps: true
});

// Method tạo meta tags
seoSchema.methods.generateMetaTags = function(customData = {}) {
    const metaTags = [
        { name: 'title', content: customData.title || this.defaultTitle },
        { name: 'description', content: customData.description || this.defaultDescription },
        { name: 'keywords', content: customData.keywords?.join(',') || this.defaultKeywords.join(',') },
        { name: 'robots', content: customData.robots || this.robots },
        
        // Open Graph tags
        { property: 'og:title', content: customData.title || this.defaultTitle },
        { property: 'og:description', content: customData.description || this.defaultDescription },
        { property: 'og:image', content: customData.image || this.socialImage },
        { property: 'og:url', content: customData.url || this.canonicalUrl },
        { property: 'og:type', content: customData.type || 'website' },
        { property: 'og:site_name', content: this.siteName },
        
        // Twitter Card tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: customData.title || this.defaultTitle },
        { name: 'twitter:description', content: customData.description || this.defaultDescription },
        { name: 'twitter:image', content: customData.image || this.socialImage }
    ];

    // Thêm canonical URL nếu có
    if (customData.canonicalUrl || this.canonicalUrl) {
        metaTags.push({
            rel: 'canonical',
            href: customData.canonicalUrl || this.canonicalUrl
        });
    }

    // Thêm Facebook App ID nếu có
    if (this.facebookAppId) {
        metaTags.push({
            property: 'fb:app_id',
            content: this.facebookAppId
        });
    }

    // Thêm custom meta tags
    if (this.customMetaTags?.length > 0) {
        metaTags.push(...this.customMetaTags);
    }

    return metaTags;
};

// Method tạo structured data
seoSchema.methods.generateStructuredData = function(customData = {}) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': []
    };

    // Organization schema
    if (this.structuredData.organization) {
        const org = this.structuredData.organization;
        structuredData['@graph'].push({
            '@type': 'Organization',
            '@id': `${this.canonicalUrl}#organization`,
            name: org.name,
            url: this.canonicalUrl,
            logo: {
                '@type': 'ImageObject',
                url: org.logo
            },
            address: org.address,
            telephone: org.phone,
            email: org.email,
            sameAs: org.socialLinks?.map(link => link.url)
        });
    }

    // Website schema
    structuredData['@graph'].push({
        '@type': 'WebSite',
        '@id': `${this.canonicalUrl}#website`,
        url: this.canonicalUrl,
        name: this.siteName,
        publisher: {
            '@id': `${this.canonicalUrl}#organization`
        }
    });

    // Breadcrumb schema
    if (this.structuredData.breadcrumb?.enabled && customData.breadcrumb) {
        structuredData['@graph'].push({
            '@type': 'BreadcrumbList',
            '@id': `${customData.url}#breadcrumb`,
            itemListElement: customData.breadcrumb.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'WebPage',
                    '@id': item.url,
                    url: item.url,
                    name: item.name
                }
            }))
        });
    }

    // WebPage schema
    if (customData.url) {
        structuredData['@graph'].push({
            '@type': 'WebPage',
            '@id': customData.url,
            url: customData.url,
            name: customData.title || this.defaultTitle,
            description: customData.description || this.defaultDescription,
            isPartOf: {
                '@id': `${this.canonicalUrl}#website`
            },
            inLanguage: 'vi-VN',
            potentialAction: [{
                '@type': 'ReadAction',
                target: [customData.url]
            }]
        });
    }

    return structuredData;
};

// Đảm bảo chỉ có một bản ghi SEO
seoSchema.statics.getInstance = async function() {
    let seo = await this.findOne();
    if (!seo) {
        seo = await this.create({
            siteName: 'LTV Law',
            defaultTitle: 'LTV Law - Tư vấn pháp luật',
            defaultDescription: 'Trang thông tin pháp luật uy tín, cung cấp dịch vụ tư vấn pháp luật chuyên nghiệp',
            defaultKeywords: ['luật', 'pháp luật', 'tư vấn pháp luật'],
            logo: '/images/logo.png',
            socialImage: '/images/social-share.jpg',
            canonicalUrl: 'https://ltvlaw.vn'
        });
    }
    return seo;
};

const SEO = mongoose.model('SEO', seoSchema);

module.exports = SEO; 