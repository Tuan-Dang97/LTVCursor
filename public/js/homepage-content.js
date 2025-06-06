// Homepage Dynamic Content Loader
class HomepageContent {
    constructor() {
        this.apiBase = '/api';
        this.categories = {
            'so-huu-tri-tue': 'sở hữu trí tuệ',
            'phap-luat-doanh-nghiep': 'doanh nghiệp'
        };
        this.init();
    }

    async init() {
        try {
            await this.loadAllContent();
        } catch (error) {
            console.error('Error initializing homepage content:', error);
        }
    }

    async loadAllContent() {
        // Load tất cả categories
        const categories = await this.loadCategories();
        
        // Load content theo từng section
        await Promise.all([
            this.loadIntellectualPropertyPosts(),
            this.loadBusinessLawPosts(), 
            this.loadFeaturedPosts(),
            this.loadRecentPosts(),
            this.loadPopularPosts()
        ]);
    }

    // Load categories từ API
    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBase}/categories/public`);
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    }

    // Load bài viết Pháp luật sở hữu trí tuệ
    async loadIntellectualPropertyPosts() {
        try {
            const category = await this.findCategoryBySlug('so-huu-tri-tue');
            if (!category) return;

            const posts = await this.loadPostsByCategory(category._id, 6);
            this.renderSectionPosts(posts, 'intellectual-property-posts', 'Pháp luật sở hữu trí tuệ');
        } catch (error) {
            console.error('Error loading intellectual property posts:', error);
        }
    }

    // Load bài viết Pháp luật doanh nghiệp  
    async loadBusinessLawPosts() {
        try {
            const category = await this.findCategoryBySlug('phap-luat-doanh-nghiep');
            if (!category) return;

            const posts = await this.loadPostsByCategory(category._id, 6);
            this.renderSectionPosts(posts, 'business-law-posts', 'Pháp luật doanh nghiệp');
        } catch (error) {
            console.error('Error loading business law posts:', error);
        }
    }

    // Load bài viết nổi bật
    async loadFeaturedPosts() {
        try {
            const response = await fetch(`${this.apiBase}/posts/public?featured=true&limit=4`);
            const result = await response.json();
            
            if (result.success && result.data.posts.length > 0) {
                this.renderFeaturedSection(result.data.posts);
            }
        } catch (error) {
            console.error('Error loading featured posts:', error);
        }
    }

    // Load bài viết mới nhất
    async loadRecentPosts() {
        try {
            const response = await fetch(`${this.apiBase}/posts/public?limit=8&sort=newest`);
            const result = await response.json();
            
            if (result.success && result.data.posts.length > 0) {
                this.renderSectionPosts(result.data.posts, 'recent-posts', 'Bài viết mới');
            }
        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }

    // Load bài viết xem nhiều
    async loadPopularPosts() {
        try {
            const response = await fetch(`${this.apiBase}/posts/public?limit=8&sort=popular`);
            const result = await response.json();
            
            if (result.success && result.data.posts.length > 0) {
                this.renderSectionPosts(result.data.posts, 'popular-posts', 'Bài viết xem nhiều');
            }
        } catch (error) {
            console.error('Error loading popular posts:', error);
        }
    }

    // Helper: Tìm category theo slug
    async findCategoryBySlug(slug) {
        try {
            const categories = await this.loadCategories();
            return categories.find(cat => cat.slug === slug);
        } catch (error) {
            console.error('Error finding category:', error);
            return null;
        }
    }

    // Helper: Load posts theo category
    async loadPostsByCategory(categoryId, limit = 6) {
        try {
            const response = await fetch(`${this.apiBase}/posts/public?category=${categoryId}&limit=${limit}`);
            const result = await response.json();
            return result.success ? result.data.posts : [];
        } catch (error) {
            console.error('Error loading posts by category:', error);
            return [];
        }
    }

    // Render posts cho một section cụ thể
    renderSectionPosts(posts, containerId, sectionTitle) {
        // Thử tìm container theo ID
        let container = document.getElementById(containerId);
        
        // Nếu không có ID, tìm theo text của header
        if (!container) {
            container = this.findContainerByTitle(sectionTitle);
        }
        
        if (!container) {
            console.warn(`Container not found for: ${sectionTitle} (${containerId})`);
            return;
        }

        const html = posts.map(post => `
            <article class="post-item">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" />
                </div>
                <div class="post-content">
                    <h4><a href="${post.link}">${post.title}</a></h4>
                    <time datetime="${new Date(post.date).toISOString().split('T')[0]}">${post.date}</time>
                </div>
            </article>
        `).join('');

        container.innerHTML = html;
    }

    // Render section bài viết nổi bật
    renderFeaturedSection(posts) {
        const container = this.findContainerByTitle('Chia sẻ kinh nghiệm') || 
                         document.querySelector('.featured-articles');
        
        if (!container) return;

        const html = posts.slice(0, 2).map(post => `
            <article class="featured-article">
                <div class="article-image">
                    <img src="${post.image}" alt="${post.title}" />
                </div>
                <div class="article-content">
                    <h3><a href="${post.link}">${post.title}</a></h3>
                    <p>${post.excerpt}</p>
                </div>
            </article>
        `).join('');

        container.innerHTML = html;
    }

    // Helper: Tìm container theo title của section header
    findContainerByTitle(title) {
        const headers = document.querySelectorAll('h2, h3');
        
        for (const header of headers) {
            if (header.textContent.trim().includes(title)) {
                // Tìm container posts gần nhất
                const section = header.closest('section') || header.closest('.content-grid') || header.closest('.services-column');
                if (section) {
                    return section.querySelector('.post-list, .featured-articles, .article-list, .services-grid') ||
                           section.querySelector('[class*="posts"]') ||
                           section.querySelector('[class*="articles"]');
                }
            }
        }
        return null;
    }

    // Update content theo real-time (gọi lại khi cần refresh)
    async refreshContent() {
        await this.loadAllContent();
    }
}

// Auto-initialize khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.homepageContent = new HomepageContent();
});

// Expose refresh function globally
window.refreshHomepageContent = () => {
    if (window.homepageContent) {
        window.homepageContent.refreshContent();
    }
}; 