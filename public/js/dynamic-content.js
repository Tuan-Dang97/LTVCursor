// Dynamic Content Loader for Frontend
class DynamicContent {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    async init() {
        try {
            await this.loadRecentPosts();
            await this.loadFeaturedPosts();
            await this.loadCategories();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing dynamic content:', error);
        }
    }

    // Load bài viết mới nhất
    async loadRecentPosts() {
        try {
            const response = await fetch(`${this.apiBase}/posts/public?limit=6&sort=newest`);
            if (!response.ok) throw new Error('Failed to fetch recent posts');
            
            const result = await response.json();
            if (result.success && result.data.posts.length > 0) {
                this.renderRecentPosts(result.data.posts);
            }
        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }

    // Load bài viết nổi bật
    async loadFeaturedPosts() {
        try {
            const response = await fetch(`${this.apiBase}/posts/public?featured=true&limit=3`);
            if (!response.ok) throw new Error('Failed to fetch featured posts');
            
            const result = await response.json();
            if (result.success && result.data.posts.length > 0) {
                this.renderFeaturedPosts(result.data.posts);
            }
        } catch (error) {
            console.error('Error loading featured posts:', error);
        }
    }

    // Load danh mục
    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBase}/categories/public?withCount=true`);
            if (!response.ok) throw new Error('Failed to fetch categories');
            
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                this.renderCategories(result.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Render bài viết mới nhất
    renderRecentPosts(posts) {
        const container = document.getElementById('recent-posts-container');
        if (!container) return;

        const html = posts.map(post => `
            <div class="col-lg-4 col-md-6 mb-4">
                <article class="blog-card">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="position-relative overflow-hidden">
                            <img src="${post.image}" 
                                 alt="${post.title}" 
                                 class="card-img-top blog-image"
                                 style="height: 200px; object-fit: cover;">
                            <div class="blog-overlay">
                                <div class="blog-meta">
                                    <span class="badge badge-primary">${post.categories[0]?.name || 'Blog'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">
                                <a href="${post.link}" class="text-decoration-none text-dark">
                                    ${post.title}
                                </a>
                            </h5>
                            <p class="card-text text-muted flex-grow-1">
                                ${post.excerpt}
                            </p>
                            <div class="d-flex justify-content-between align-items-center mt-auto">
                                <small class="text-muted">
                                    <i class="fas fa-calendar-alt me-1"></i>
                                    ${post.date}
                                </small>
                                <small class="text-muted">
                                    <i class="fas fa-eye me-1"></i>
                                    ${post.views} lượt xem
                                </small>
                            </div>
                            <a href="${post.link}" class="btn btn-outline-primary mt-3">
                                Đọc thêm <i class="fas fa-arrow-right ms-1"></i>
                            </a>
                        </div>
                    </div>
                </article>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Render bài viết nổi bật
    renderFeaturedPosts(posts) {
        const container = document.getElementById('featured-posts-container');
        if (!container) return;

        const html = posts.map(post => `
            <div class="col-lg-4 mb-4">
                <div class="featured-post-card h-100">
                    <div class="card border-0 shadow-lg h-100">
                        <div class="position-relative">
                            <img src="${post.image}" 
                                 alt="${post.title}" 
                                 class="card-img-top"
                                 style="height: 250px; object-fit: cover;">
                            <div class="featured-badge">
                                <span class="badge badge-warning">
                                    <i class="fas fa-star me-1"></i>Nổi bật
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                ${post.categories.map(cat => `
                                    <span class="badge badge-outline-primary me-1">${cat.name}</span>
                                `).join('')}
                            </div>
                            <h4 class="card-title">
                                <a href="${post.link}" class="text-decoration-none">
                                    ${post.title}
                                </a>
                            </h4>
                            <p class="card-text text-muted">
                                ${post.excerpt}
                            </p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    ${post.date} • ${post.views} lượt xem
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Render danh mục
    renderCategories(categories) {
        const container = document.getElementById('categories-menu');
        if (!container) return;

        const html = categories.map(category => `
            <li class="nav-item">
                <a class="nav-link" href="${category.link}">
                    ${category.name}
                    ${category.postCount > 0 ? `<span class="badge badge-light ms-1">${category.postCount}</span>` : ''}
                </a>
            </li>
        `).join('');

        container.innerHTML = html;
    }

    // Load bài viết theo danh mục
    async loadPostsByCategory(categoryId, limit = 6) {
        try {
            const response = await fetch(`${this.apiBase}/posts/public?category=${categoryId}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch posts by category');
            
            const result = await response.json();
            return result.success ? result.data.posts : [];
        } catch (error) {
            console.error('Error loading posts by category:', error);
            return [];
        }
    }

    // Search posts
    async searchPosts(query, limit = 10) {
        try {
            const response = await fetch(`${this.apiBase}/posts/public?search=${encodeURIComponent(query)}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to search posts');
            
            const result = await response.json();
            return result.success ? result.data.posts : [];
        } catch (error) {
            console.error('Error searching posts:', error);
            return [];
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        if (searchInput && searchResults) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length < 2) {
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                    return;
                }
                
                searchTimeout = setTimeout(async () => {
                    const posts = await this.searchPosts(query, 5);
                    this.renderSearchResults(posts, searchResults);
                }, 300);
            });
        }

        // Category filter buttons
        const categoryButtons = document.querySelectorAll('[data-category-filter]');
        categoryButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const categoryId = button.dataset.categoryFilter;
                const posts = await this.loadPostsByCategory(categoryId);
                this.renderRecentPosts(posts);
                
                // Update active state
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    // Render search results
    renderSearchResults(posts, container) {
        if (posts.length === 0) {
            container.innerHTML = '<div class="p-3 text-muted">Không tìm thấy kết quả</div>';
        } else {
            const html = posts.map(post => `
                <div class="search-result-item p-3 border-bottom">
                    <a href="${post.link}" class="text-decoration-none">
                        <h6 class="mb-1">${post.title}</h6>
                        <p class="mb-1 text-muted small">${post.excerpt}</p>
                        <small class="text-muted">${post.date}</small>
                    </a>
                </div>
            `).join('');
            container.innerHTML = html;
        }
        
        container.style.display = 'block';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DynamicContent();
}); 