// CATEGORY MANAGER - Quản lý các trang category (Fixed version)
class CategoryManager {
    constructor(categorySlug) {
        this.categorySlug = categorySlug;
        this.currentPage = 1;
        this.postsPerPage = 9;
        this.currentSort = "newest";
        this.allPosts = [];
        this.filteredPosts = [];
    }

    init() {
        console.log(`🚀 Khởi tạo Category Manager cho: ${this.categorySlug}`);

        // Kiểm tra và load dữ liệu
        this.loadCategoryData();

        // Render các phần tử (chỉ render nếu container tồn tại)
        this.renderFeaturedArticles();
        this.renderPopularPosts();
        this.renderAllArticles();

        // Bind events
        this.bindEvents();

        console.log("✅ Category Manager đã sẵn sàng!");
        console.log(`📊 Tổng số bài viết: ${this.allPosts.length}`);
    }

    loadCategoryData() {
        // Lấy dữ liệu từ blogData (từ blog-manager.js)
        if (typeof blogData !== "undefined" && blogData[this.categorySlug]) {
            const categoryData = blogData[this.categorySlug];

            // Tạo danh sách tất cả bài viết
            this.allPosts = [];

            // Thêm featured post nếu có
            if (categoryData.featuredPost) {
                this.allPosts.push({
                    ...categoryData.featuredPost,
                    isFeatured: true,
                    views: Math.floor(Math.random() * 1000) + 100,
                    excerpt:
                        categoryData.featuredPost.description ||
                        "Mô tả ngắn về bài viết này...",
                });
            }

            // Thêm featured articles nếu có
            if (categoryData.featuredArticles) {
                categoryData.featuredArticles.forEach((article) => {
                    this.allPosts.push({
                        ...article,
                        isFeatured: true,
                        views: Math.floor(Math.random() * 1000) + 100,
                        excerpt:
                            article.description ||
                            "Mô tả ngắn về bài viết này...",
                    });
                });
            }

            // Thêm posts thường
            if (categoryData.posts) {
                categoryData.posts.forEach((post) => {
                    this.allPosts.push({
                        ...post,
                        isFeatured: false,
                        views: Math.floor(Math.random() * 500) + 50,
                        excerpt:
                            post.excerpt ||
                            "Tóm tắt nội dung bài viết này. Đây là phần mô tả ngắn gọn về chủ đề chính của bài viết.",
                        description:
                            post.description ||
                            "Mô tả chi tiết hơn về nội dung bài viết...",
                    });
                });
            }

            // Thêm articles nếu có
            if (categoryData.articles) {
                categoryData.articles.forEach((article) => {
                    this.allPosts.push({
                        ...article,
                        isFeatured: false,
                        views: Math.floor(Math.random() * 500) + 50,
                        excerpt:
                            article.excerpt ||
                            "Tóm tắt nội dung bài viết này. Đây là phần mô tả ngắn gọn về chủ đề chính của bài viết.",
                    });
                });
            }

            this.filteredPosts = [...this.allPosts];
            console.log(
                `📚 Đã load ${this.allPosts.length} bài viết cho category: ${this.categorySlug}`
            );
        } else {
            console.warn(
                `⚠️ Không tìm thấy dữ liệu cho category: ${this.categorySlug}`
            );
            console.log(
                "🔍 Available blogData keys:",
                typeof blogData !== "undefined"
                    ? Object.keys(blogData)
                    : "blogData is undefined"
            );
            // Tạo dữ liệu demo
            this.createDemoData();
        }
    }

    createDemoData() {
        // Tạo dữ liệu demo nếu không có dữ liệu thật
        this.allPosts = Array.from({ length: 20 }, (_, i) => ({
            title: `Bài viết demo số ${i + 1} - ${this.getCategoryName()}`,
            image: "./image/thanh-lap-cong-ty-co-phan.jpg",
            link: `/post/demo-${i + 1}`,
            date: this.getRandomDate(),
            excerpt: `Đây là phần tóm tắt cho bài viết demo số ${
                i + 1
            }. Nội dung mô tả ngắn gọn về chủ đề chính của bài viết này.`,
            views: Math.floor(Math.random() * 1000) + 100,
            isFeatured: i < 2,
        }));

        this.filteredPosts = [...this.allPosts];
        console.log(`📝 Đã tạo ${this.allPosts.length} bài viết demo`);
    }

    getCategoryName() {
        const categoryNames = {
            "so-huu-tri-tue": "Pháp luật sở hữu trí tuệ",
            "phap-luat-doanh-nghiep": "Pháp luật doanh nghiệp",
            "bai-viet-xem-nhieu": "Bài viết xem nhiều",
            "bai-viet-moi": "Bài viết mới",
        };
        return categoryNames[this.categorySlug] || "Danh mục";
    }

    getRandomDate() {
        const start = new Date(2024, 0, 1);
        const end = new Date();
        const date = new Date(
            start.getTime() + Math.random() * (end.getTime() - start.getTime())
        );
        return date.toLocaleDateString("vi-VN");
    }

    renderFeaturedArticles() {
        const container = document.getElementById("featured-articles");
        if (!container) {
            console.log("ℹ️ Featured articles container not found - skipping");
            return;
        }

        const featuredPosts = this.allPosts
            .filter((post) => post.isFeatured)
            .slice(0, 4);

        if (featuredPosts.length === 0) {
            container.innerHTML =
                '<p class="text-center">Chưa có bài viết nổi bật</p>';
            return;
        }

        const featuredHTML = featuredPosts
            .map(
                (post) => `
            <article class="featured-card" data-link="${post.link}">
                <div class="featured-card-image">
                    <img src="${post.image}" alt="${post.title}" />
                </div>
                <div class="featured-card-content">
                    <h3 class="featured-card-title">${post.title}</h3>
                    <p class="featured-card-description">${
                        post.excerpt || post.description || ""
                    }</p>
                    <div class="featured-card-meta">
                        <span class="featured-card-date">${post.date}</span>
                        <span class="featured-card-views">${
                            post.views
                        } lượt xem</span>
                    </div>
                </div>
            </article>
        `
            )
            .join("");

        container.innerHTML = featuredHTML;

        // Bind click events cho featured cards
        container.querySelectorAll(".featured-card").forEach((card) => {
            card.addEventListener("click", () => {
                const link = card.dataset.link;
                if (link) window.location.href = link;
            });
        });

        console.log(`✅ Rendered ${featuredPosts.length} featured articles`);
    }

    renderPopularPosts() {
        const container = document.getElementById("popular-posts");
        if (!container) {
            console.log("ℹ️ Popular posts container not found - skipping");
            return;
        }

        // Lấy bài viết phổ biến (sắp xếp theo views)
        const popularPosts = [...this.allPosts]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);

        const popularHTML = popularPosts
            .map(
                (post) => `
            <div class="popular-post-item" data-link="${post.link}">
                <div class="popular-post-image">
                    <img src="${post.image}" alt="${post.title}" />
                </div>
                <div class="popular-post-content">
                    <h4 class="popular-post-title">${post.title}</h4>
                    <span class="popular-post-date">${post.date}</span>
                </div>
            </div>
        `
            )
            .join("");

        container.innerHTML = popularHTML;

        // Bind click events
        container.querySelectorAll(".popular-post-item").forEach((item) => {
            item.addEventListener("click", () => {
                const link = item.dataset.link;
                if (link) window.location.href = link;
            });
        });

        console.log(`✅ Rendered ${popularPosts.length} popular posts`);
    }

    renderAllArticles() {
        this.sortPosts();
        this.renderArticlesGrid();
        this.renderPagination();
    }

    sortPosts() {
        switch (this.currentSort) {
            case "newest":
                this.filteredPosts.sort((a, b) => {
                    const dateA = a.date
                        ? a.date.split("/").reverse().join("-")
                        : "2024/01/01";
                    const dateB = b.date
                        ? b.date.split("/").reverse().join("-")
                        : "2024/01/01";
                    return new Date(dateB) - new Date(dateA);
                });
                break;
            case "oldest":
                this.filteredPosts.sort((a, b) => {
                    const dateA = a.date
                        ? a.date.split("/").reverse().join("-")
                        : "2024/01/01";
                    const dateB = b.date
                        ? b.date.split("/").reverse().join("-")
                        : "2024/01/01";
                    return new Date(dateA) - new Date(dateB);
                });
                break;
            case "popular":
                this.filteredPosts.sort((a, b) => b.views - a.views);
                break;
        }
    }

    renderArticlesGrid() {
        const container = document.getElementById("articles-list");
        if (!container) {
            console.error("❌ Articles container not found!");
            return;
        }

        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

        console.log(
            `🔄 Rendering ${postsToShow.length} articles (page ${this.currentPage})`
        );

        if (postsToShow.length === 0) {
            container.innerHTML =
                '<p class="text-center">Không có bài viết nào</p>';
            return;
        }

        const articlesHTML = postsToShow
            .map(
                (post) => `
            <article class="article-card" data-link="${post.link}">
                <div class="article-card-image">
                    <img src="${post.image}" alt="${post.title}" />
                </div>
                <div class="article-card-content">
                    <h3 class="article-card-title">${post.title}</h3>
                    <p class="article-card-excerpt">${post.excerpt}</p>
                    <div class="article-card-meta">
                        <span class="article-card-date">${post.date}</span>
                        <span class="article-card-views">${post.views} lượt xem</span>
                    </div>
                </div>
            </article>
        `
            )
            .join("");

        container.innerHTML = articlesHTML;

        // Bind click events
        container.querySelectorAll(".article-card").forEach((card) => {
            card.addEventListener("click", () => {
                const link = card.dataset.link;
                if (link) window.location.href = link;
            });
        });

        console.log(`✅ Rendered ${postsToShow.length} articles successfully`);
    }

    renderPagination() {
        const container = document.getElementById("pagination");
        if (!container) {
            console.log("ℹ️ Pagination container not found - skipping");
            return;
        }

        const totalPages = Math.ceil(
            this.filteredPosts.length / this.postsPerPage
        );

        if (totalPages <= 1) {
            container.innerHTML = "";
            return;
        }

        let paginationHTML = "";

        // Previous button
        const prevDisabled = this.currentPage === 1 ? "disabled" : "";
        paginationHTML += `
            <a href="#" class="pagination-item ${prevDisabled}" data-page="${
            this.currentPage - 1
        }">
                « Trước
            </a>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML +=
                '<a href="#" class="pagination-item" data-page="1">1</a>';
            if (startPage > 2) {
                paginationHTML +=
                    '<span class="pagination-item disabled">...</span>';
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? "active" : "";
            paginationHTML += `
                <a href="#" class="pagination-item ${activeClass}" data-page="${i}">${i}</a>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML +=
                    '<span class="pagination-item disabled">...</span>';
            }
            paginationHTML += `<a href="#" class="pagination-item" data-page="${totalPages}">${totalPages}</a>`;
        }

        // Next button
        const nextDisabled = this.currentPage === totalPages ? "disabled" : "";
        paginationHTML += `
            <a href="#" class="pagination-item ${nextDisabled}" data-page="${
            this.currentPage + 1
        }">
                Sau »
            </a>
        `;

        container.innerHTML = paginationHTML;
        console.log(`✅ Rendered pagination (${totalPages} pages)`);
    }

    bindEvents() {
        // Sort filter
        const sortFilter = document.getElementById("sort-filter");
        if (sortFilter) {
            sortFilter.addEventListener("change", (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 1;
                console.log(`🔄 Sorting by: ${this.currentSort}`);
                this.renderAllArticles();
            });
        }

        // Pagination
        const paginationContainer = document.getElementById("pagination");
        if (paginationContainer) {
            paginationContainer.addEventListener("click", (e) => {
                e.preventDefault();

                if (
                    e.target.classList.contains("pagination-item") &&
                    !e.target.classList.contains("disabled") &&
                    !e.target.classList.contains("active")
                ) {
                    const page = parseInt(e.target.dataset.page);
                    if (page && page !== this.currentPage) {
                        this.currentPage = page;
                        console.log(`📄 Switching to page: ${page}`);
                        this.renderAllArticles();

                        // Scroll to articles section
                        const articlesSection =
                            document.querySelector(".articles-section");
                        if (articlesSection) {
                            articlesSection.scrollIntoView({
                                behavior: "smooth",
                            });
                        }
                    }
                }
            });
        }

        console.log("✅ Events bound successfully");
    }

    // Public methods để thêm/sửa/xóa bài viết
    addPost(newPost, isFeatured = false) {
        const post = {
            ...newPost,
            isFeatured,
            views: Math.floor(Math.random() * 100) + 10,
            excerpt: newPost.excerpt || "Tóm tắt nội dung bài viết...",
        };

        this.allPosts.unshift(post);
        this.filteredPosts = [...this.allPosts];
        this.currentPage = 1;

        // Re-render
        this.renderFeaturedArticles();
        this.renderPopularPosts();
        this.renderAllArticles();

        console.log("✅ Đã thêm bài viết mới:", newPost.title);
        return true;
    }

    removePost(postTitle) {
        const initialLength = this.allPosts.length;
        this.allPosts = this.allPosts.filter(
            (post) => post.title !== postTitle
        );
        this.filteredPosts = [...this.allPosts];

        if (this.allPosts.length < initialLength) {
            // Adjust current page if necessary
            const totalPages = Math.ceil(
                this.filteredPosts.length / this.postsPerPage
            );
            if (this.currentPage > totalPages) {
                this.currentPage = Math.max(1, totalPages);
            }

            // Re-render
            this.renderFeaturedArticles();
            this.renderPopularPosts();
            this.renderAllArticles();

            console.log("✅ Đã xóa bài viết:", postTitle);
            return true;
        }

        console.log("❌ Không tìm thấy bài viết để xóa:", postTitle);
        return false;
    }

    updatePost(postTitle, updatedData) {
        const postIndex = this.allPosts.findIndex(
            (post) => post.title === postTitle
        );

        if (postIndex !== -1) {
            this.allPosts[postIndex] = {
                ...this.allPosts[postIndex],
                ...updatedData,
            };
            this.filteredPosts = [...this.allPosts];

            // Re-render
            this.renderFeaturedArticles();
            this.renderPopularPosts();
            this.renderAllArticles();

            console.log("✅ Đã cập nhật bài viết:", postTitle);
            return true;
        }

        console.log("❌ Không tìm thấy bài viết để cập nhật:", postTitle);
        return false;
    }

    // Search functionality
    searchPosts(query) {
        if (!query.trim()) {
            this.filteredPosts = [...this.allPosts];
        } else {
            this.filteredPosts = this.allPosts.filter(
                (post) =>
                    post.title.toLowerCase().includes(query.toLowerCase()) ||
                    (post.excerpt &&
                        post.excerpt
                            .toLowerCase()
                            .includes(query.toLowerCase()))
            );
        }

        this.currentPage = 1;
        this.renderAllArticles();

        console.log(
            `🔍 Tìm thấy ${this.filteredPosts.length} bài viết cho từ khóa: "${query}"`
        );
    }

    // Get statistics
    getStats() {
        return {
            totalPosts: this.allPosts.length,
            featuredPosts: this.allPosts.filter((post) => post.isFeatured)
                .length,
            totalViews: this.allPosts.reduce(
                (sum, post) => sum + post.views,
                0
            ),
            averageViews:
                Math.round(
                    this.allPosts.reduce((sum, post) => sum + post.views, 0) /
                        this.allPosts.length
                ) || 0,
            currentPage: this.currentPage,
            totalPages: Math.ceil(
                this.filteredPosts.length / this.postsPerPage
            ),
        };
    }

    // Debug method
    debug() {
        console.log("🔍 CategoryManager Debug Info:");
        console.log("- Category Slug:", this.categorySlug);
        console.log("- Total Posts:", this.allPosts.length);
        console.log("- Filtered Posts:", this.filteredPosts.length);
        console.log("- Current Page:", this.currentPage);
        console.log("- Current Sort:", this.currentSort);
        console.log("- All Posts Sample:", this.allPosts.slice(0, 3));
        console.log("- blogData available:", typeof blogData !== "undefined");
        if (typeof blogData !== "undefined") {
            console.log("- blogData keys:", Object.keys(blogData));
            console.log(
                "- Current category data:",
                blogData[this.categorySlug]
            );
        }
    }
}

// Export cho global scope
window.CategoryManager = CategoryManager;

// Utility functions
window.categoryUtils = {
    // Tạo bài viết mới nhanh
    createQuickPost: function (title, categorySlug = "so-huu-tri-tue") {
        return {
            title: title,
            image: "./image/thanh-lap-cong-ty-co-phan.jpg",
            link: `/post/${title.toLowerCase().replace(/\s+/g, "-")}`,
            date: new Date().toLocaleDateString("vi-VN"),
            excerpt: `Tóm tắt nội dung cho bài viết: ${title}`,
        };
    },

    // Format date
    formatDate: function (dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    },

    // Generate random views
    randomViews: function (min = 50, max = 1000) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Debug helper
    debugCategoryManager: function (categorySlug) {
        if (window.categoryManagerInstance) {
            window.categoryManagerInstance.debug();
        } else {
            console.log("No CategoryManager instance found. Create one first.");
        }
    },
};

console.log("📦 Category Manager đã được load thành công!");
