const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const Post = require('../models/Post');

async function generateSitemap(baseUrl) {
    try {
        // Lấy tất cả bài viết đã publish
        const posts = await Post.find({ status: 'published' })
            .select('slug updatedAt')
            .lean();

        // Tạo links
        const links = [
            { url: '/', changefreq: 'daily', priority: 1 },
            { url: '/about', changefreq: 'monthly', priority: 0.8 },
            { url: '/contact', changefreq: 'monthly', priority: 0.8 },
            { url: '/services', changefreq: 'monthly', priority: 0.8 },
        ];

        // Thêm links từ bài viết
        posts.forEach(post => {
            links.push({
                url: `/posts/${post.slug}`,
                changefreq: 'weekly',
                priority: 0.7,
                lastmod: post.updatedAt
            });
        });

        // Tạo stream
        const stream = new SitemapStream({ hostname: baseUrl });
        
        // Trả về sitemap XML
        const data = await streamToPromise(Readable.from(links).pipe(stream));
        return data.toString();
    } catch (error) {
        console.error('Error generating sitemap:', error);
        throw error;
    }
}

module.exports = generateSitemap; 