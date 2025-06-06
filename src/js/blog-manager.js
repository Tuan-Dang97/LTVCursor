// BLOG MANAGER - PHIÊN BẢN ĐƠN GIẢN CHO SECTION CỤ THỂ
// Copy toàn bộ code này vào file js/blog-manager.js

// Dữ liệu bài viết
const blogData = {
    "so-huu-tri-tue": {
        categoryName: "Pháp luật sở hữu trí tuệ",
        sectionId: "category-so-huu-tri-tue",
        featuredPost: {
            title: "Hồ sơ, thủ tục và cách đăng ký thành lập công ty, doanh nghiệp",
            description:
                "16 năm thành lập hơn 70.000 doanh nghiệp. Anpha tự tin cung cấp dịch vụ thành lập công ty chỉ 250.000đ tại Hà Nội, Tphcm và các tỉnh lân cận",
            image: "./image/thanh-lap-cong-ty-co-phan.jpg",
            link: "/post/thanh-lap-cong-ty",
        },
        posts: [
            {
                title: "Bài viết 1",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 2",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 3",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 4",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 5",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
        ],
    },
    "noi-bat": {
        categoryName: "Nổi bật",
        sectionId: "category-noi-bat",
        posts: [
            {
                title: "Bài viết 5",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 5",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 5",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
        ],
    },

    "phap-luat-doanh-nghiep": {
        categoryName: "Pháp luật doanh nghiệp",
        sectionId: "category-phap-luat-doanh-nghiep",
        featuredArticles: [
            {
                title: "Các loại hình Doanh Nghiệp và ưu nhược điểm - Ngắn, dễ hiểu",
                description:
                    "Bài viết tập trung phân tích ưu nhược điểm của các loại hình doanh nghiệp tại Việt Nam gồm công ty TNHH 1 thành viên, công ty TNHH 2 thành viên trở lên, công ty cổ phần và doanh nghiệp tư nhân, công ty hợp danh. Nếu có dự định thành lập công ty bạn không thể bỏ qua bài viết này.",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/cac-loai-hinh-doanh-nghiep",
            },
            {
                title: "Nên thành lập công ty hay hộ kinh doanh - Đọc xong bạn sẽ BIẾT",
                description:
                    "Bạn nên thành lập công ty hay đăng ký hộ kinh doanh cá thể? Ưu điểm và nhược điểm của từng loại hình này như thế nào? Hiện nay, đăng ký theo loại hình nào thì phổ biến hơn? Đọc xong bài viết này bạn sẽ trả lời được những câu hỏi trên.",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/cong-ty-hay-ho-kinh-doanh",
            },
        ],
        articles: [
            {
                title: "Bài viết 1",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 2",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 3",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 4",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 5",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
        ],
    },

    "bai-viet-xem-nhieu": {
        categoryName: "Bài viết xem nhiều",
        sectionId: "category-bai-viet-xem-nhieu",
        posts: [
            {
                title: "Bài viết 1",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 2",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 3",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 4",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 5",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 6",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 7",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },

        ],
    },

    "bai-viet-moi": {
        categoryName: "Bài viết mới",
        sectionId: "category-bai-viet-moi",
        posts: [
            {
                title: "Bài viết 1",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 2",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 3",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 4",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 5",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 6",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
            {
                title: "Bài viết 7",
                image: "./image/thanh-lap-cong-ty-co-phan.jpg",
                link: "/post/dat-ten-cong-ty",
                date: "09/05/2025",
            },
        ],
    },
};

// Hàm tạo HTML cho category (giống y chang cấu trúc HTML gốc của bạn)

// Hàm hiển thị bài viết
function showBlogPosts() {
    console.log("🔄 Bắt đầu hiển thị TẤT CẢ bài viết...");

    // 1. Render category "so-huu-tri-tue" + "noi-bat" (cả 2 cùng lúc)
    const categoryBlog = blogData["so-huu-tri-tue"];
    const sectionBlog = document.getElementById(categoryBlog.sectionId);
    if (sectionBlog) {
        const categoryHTML = createCategoryHTML(categoryBlog);
        sectionBlog.innerHTML = categoryHTML;
        console.log("✅ Đã hiển thị: Pháp luật sở hữu trí tuệ + Nổi bật");
    } else {
        console.warn("⚠️ Không tìm thấy section:", categoryBlog.sectionId);
    }

    // 2. Render category "phap-luat-doanh-nghiep" + "bai-viet-xem-nhieu" (sidebar)
    const categoryDoanhNghiep = blogData["phap-luat-doanh-nghiep"];
    const sectionDoanhNghiep = document.getElementById(
        categoryDoanhNghiep.sectionId
    );
    if (sectionDoanhNghiep) {
        const contentHTML = createContentSectionHTML(categoryDoanhNghiep);
        sectionDoanhNghiep.innerHTML = contentHTML;
        console.log(
            "✅ Đã hiển thị: Pháp luật doanh nghiệp + Bài viết xem nhiều"
        );
    } else {
        console.warn(
            "⚠️ Không tìm thấy section:",
            categoryDoanhNghiep.sectionId
        );
    }

    // 3. Render category "bai-viet-moi"
    const categoryBaiMoi = blogData["bai-viet-moi"];
    const sectionBaiMoi = document.getElementById(categoryBaiMoi.sectionId);
    if (sectionBaiMoi) {
        const serviceListHTML = createServiceListHTML(categoryBaiMoi);
        sectionBaiMoi.innerHTML = serviceListHTML;
        console.log("✅ Đã hiển thị: Bài viết mới");
    } else {
        console.warn("⚠️ Không tìm thấy section:", categoryBaiMoi.sectionId);
    }

    console.log("🎉 Hoàn thành hiển thị TẤT CẢ 5 categories!");
}

// THÊM CÁC HÀM TIỆN ÍCH (nếu chưa có)
// Thêm bài viết vào Pháp luật doanh nghiệp
function addDoanhNghiepPost(newPost, isFeatured = false) {
    console.log("➕ Thêm bài viết vào Pháp luật doanh nghiệp...");

    const category = blogData["phap-luat-doanh-nghiep"];

    if (isFeatured) {
        category.featuredArticles.unshift(newPost);
        console.log("⭐ Đã thêm bài nổi bật");
    } else {
        category.articles.unshift(newPost);
        console.log("📝 Đã thêm bài thường");
    }

    // Re-render category này
    const section = document.getElementById(category.sectionId);
    if (section) {
        const contentHTML = createContentSectionHTML(category);
        section.innerHTML = contentHTML;
    }

    return true;
}

// Thêm bài viết vào Bài viết xem nhiều (sidebar)
function addXemNhieuPost(newPost) {
    console.log("➕ Thêm bài viết vào Bài viết xem nhiều...");

    const category = blogData["bai-viet-xem-nhieu"];
    category.posts.unshift(newPost);

    // Re-render cả content-section (vì sidebar nằm trong đó)
    const categoryDoanhNghiep = blogData["phap-luat-doanh-nghiep"];
    const sectionDoanhNghiep = document.getElementById(
        categoryDoanhNghiep.sectionId
    );
    if (sectionDoanhNghiep) {
        const contentHTML = createContentSectionHTML(categoryDoanhNghiep);
        sectionDoanhNghiep.innerHTML = contentHTML;
    }

    console.log("✅ Đã thêm vào Bài viết xem nhiều");
    return true;
}

// Thêm bài viết vào Bài viết mới
function addBaiMoiPost(newPost) {
    console.log("➕ Thêm bài viết vào Bài viết mới...");

    const category = blogData["bai-viet-moi"];
    category.posts.unshift(newPost);

    // Re-render category này
    const section = document.getElementById(category.sectionId);
    if (section) {
        const serviceListHTML = createServiceListHTML(category);
        section.innerHTML = serviceListHTML;
    }

    console.log("✅ Đã thêm vào Bài viết mới");
    return true;
}

// THÊM VÀO GLOBAL FUNCTIONS (cuối file)
window.addDoanhNghiepPost = addDoanhNghiepPost;
window.addXemNhieuPost = addXemNhieuPost;
window.addBaiMoiPost = addBaiMoiPost;

// Hàm thêm bài viết mới
function addNewPost(newPost, isFeatured = false) {
    console.log("➕ Thêm bài viết mới...");

    const category = blogData["so-huu-tri-tue"];

    if (isFeatured) {
        // Thêm làm bài viết nổi bật
        category.featuredPost = newPost;
        console.log("⭐ Đã thêm bài viết nổi bật:", newPost.title);
    } else {
        // Thêm vào đầu danh sách bài viết thường
        category.posts.unshift(newPost);
        console.log("📝 Đã thêm bài viết thường:", newPost.title);
    }

    // Hiển thị lại section
    showBlogPosts();
    return true;
}

// Hàm xóa bài viết (bonus)
function removePost(postTitle) {
    console.log("🗑️ Xóa bài viết:", postTitle);

    const category = blogData["so-huu-tri-tue"];

    // Tìm và xóa bài viết
    const postIndex = category.posts.findIndex(
        (post) => post.title === postTitle
    );
    if (postIndex !== -1) {
        category.posts.splice(postIndex, 1);
        showBlogPosts();
        console.log("✅ Đã xóa bài viết thành công!");
        return true;
    } else {
        console.log("❌ Không tìm thấy bài viết để xóa");
        return false;
    }
}

// Hàm sửa bài viết (bonus)
function editPost(oldTitle, newPostData) {
    console.log("✏️ Sửa bài viết:", oldTitle);

    const category = blogData["so-huu-tri-tue"];

    // Tìm và sửa bài viết
    const postIndex = category.posts.findIndex(
        (post) => post.title === oldTitle
    );
    if (postIndex !== -1) {
        category.posts[postIndex] = {
            ...category.posts[postIndex],
            ...newPostData,
        };
        showBlogPosts();
        console.log("✅ Đã sửa bài viết thành công!");
        return true;
    } else {
        console.log("❌ Không tìm thấy bài viết để sửa");
        return false;
    }
}

// Khởi động khi trang web load xong
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Bắt đầu khởi động Blog Manager...");

    // Hiển thị bài viết
    showBlogPosts();

    // Tạo các hàm global để có thể gọi từ console
    window.addNewPost = addNewPost;
    window.removePost = removePost;
    window.editPost = editPost;
    window.blogData = blogData;
    window.showBlogPosts = showBlogPosts;

    console.log("✅ Blog Manager đã sẵn sàng!");
    console.log("💡 Các lệnh có thể sử dụng:");
    console.log("   addNewPost({...}) - Thêm bài viết mới");
    console.log('   removePost("Tên bài viết") - Xóa bài viết');
    console.log('   editPost("Tên cũ", {...}) - Sửa bài viết');
    console.log("   blogData - Xem tất cả dữ liệu");
});

// Hàm tạo HTML cho services-column (layout khác với blog-column)
function createServicesHTML(category) {
    let html = `
      <header class="section-header">
        <h2>${category.categoryName}</h2>
      </header>
      <div class="service-main-wrapper">
    `;

    // Duyệt qua từng bài viết và tạo service-main
    if (category.posts && category.posts.length > 0) {
        const MAX_SERVICE_MAIN = 2; // ← THÊM DÒNG NÀY
        const postsToShow = category.posts.slice(0, MAX_SERVICE_MAIN); // ← THÊM DÒNG NÀY

        for (let i = 0; i < postsToShow.length; i++) {
            // ← SỬA
            const post = postsToShow[i]; // ← SỬA
            html += `
          <div class="service-main">
            <img src="${post.image}" alt="${post.title}" class="service-image" />
            <div class="service-overlay">
              <h3>${post.title}</h3>
            </div>
          </div>
        `;
        }
    }

    html += `</div>`;
    return html;
}

// 1. HÀM RENDER CHO PHÁP LUẬT DOANH NGHIỆP (content-section)
function createContentSectionHTML(category) {
    // Lấy data sidebar
    const categorySidebar = blogData["bai-viet-xem-nhieu"];

    let html = `
      <div class="container">
        <div class="content-grid">
          <div class="main-content">
            <header class="section-header">
              <h2>${category.categoryName}</h2>
            </header>
    `;

    // Render featured articles (2 bài nổi bật)
    if (category.featuredArticles && category.featuredArticles.length > 0) {
        const MAX_FEATURED = 2; // ← THÊM DÒNG NÀY
        const featuredToShow = category.featuredArticles.slice(0, MAX_FEATURED); // ← THÊM DÒNG NÀY

        html += `<div class="featured-articles">`;

        for (let i = 0; i < featuredToShow.length; i++) {
            const article = category.featuredArticles[i];
            html += `
              <article class="featured-article">
                <div class="article-image">
                  <img src="${article.image}" alt="${article.title}" />
                </div>
                <div class="article-content">
                  <h3>${article.title}</h3>
                  <p>${article.description}</p>
                </div>
              </article>
            `;
        }

        html += `</div>`;
    }

    // Render article list (danh sách bài viết nhỏ)
    if (category.articles && category.articles.length > 0) {
        const MAX_ARTICLES = 4; // ← THÊM DÒNG NÀY
        const articlesToShow = category.articles.slice(0, MAX_ARTICLES); // ← THÊM DÒNG NÀY

        html += `<div class="article-list">`;

        for (let i = 0; i < articlesToShow.length; i++) {
            const article = articlesToShow[i];
            html += `
              <article class="article-card">
                <div class="article-thumbnail">
                  <img src="${article.image}" alt="${article.title}" />
                </div>
                <div class="article-card-content">
                  <h4>${article.title}</h4>
                  <p class="article-date">${article.date}</p>
                </div>
              </article>
            `;
        }

        html += `</div>`;
    }

    // Thêm sidebar với data động
    html += `
          </div>
          <aside class="sidebar" id="category-bai-viet-xem-nhieu">
            ${createSidebarHTML(categorySidebar)}
          </aside>
        </div>
      </div>
    `;

    return html;
}

// 2. HÀM RENDER CHO SIDEBAR (bài viết xem nhiều)
function createSidebarHTML(category) {
    let html = `
      <header class="section-header">
        <h2>${category.categoryName}</h2>
      </header>
    `;

    // Render sidebar features
    if (category.posts && category.posts.length > 0) {
        const MAX_SIDEBAR_POSTS = 6; // ← THÊM DÒNG NÀY
        const postsToShow = category.posts.slice(0, MAX_SIDEBAR_POSTS); // ← THÊM DÒNG NÀY

        for (let i = 0; i < postsToShow.length; i++) {
            // ← SỬA
            const post = postsToShow[i];
            html += `
              <div class="sidebar-feature">
                <div class="sidebar-feature-image">
                  <img src="${post.image}" alt="${post.title}" />
                </div>
                <div class="sidebar-feature-content">
                  <p>${post.title}</p>
                </div>
              </div>
            `;
        }
    }

    return html;
}

// 3. HÀM RENDER CHO SERVICE-LIST (bài viết mới)
function createServiceListHTML(category) {
    let html = `
      <div class="container">
        <header class="section-header">
          <h2>${category.categoryName}</h2>
        </header>
        <div class="service-cards">
    `;

    // Render service cards
    if (category.posts && category.posts.length > 0) {
        const MAX_SERVICE_CARDS = 6; // ← THÊM DÒNG NÀY
        const postsToShow = category.posts.slice(0, MAX_SERVICE_CARDS); // ← THÊM DÒNG NÀY

        for (let i = 0; i < postsToShow.length; i++) {
            // ← SỬA
            const post = postsToShow[i]; // ← SỬA
            html += `
              <article class="service-card">
                <div class="service-image">
                  <img src="${post.image}" alt="${post.title}" />
                </div>
                <div class="service-content">
                  <h3>${post.title}</h3>
                  <a href="${post.link}" class="service-link" aria-label="Tìm hiểu thêm về ${post.title}"></a>
                </div>
              </article>
            `;
        }
    }

    html += `
        </div>
      </div>
    `;

    return html;
}

// THÊM HÀM NÀY VÀO FILE JS (sau phần blogData)
function createCategoryHTML(category) {
    // Lấy data của category nổi bật để render cùng
    const categoryNoiBat = blogData["noi-bat"];

    let html = `
      <div class="container">
        <div class="blog-services-grid">
          <div class="blog-column">
            <header class="section-header">
              <h2>${category.categoryName}</h2>
            </header>
    `;

    // Tạo bài viết nổi bật
    if (category.featuredPost) {
        html += `
        <article class="featured-post">
          <div class="featured-image">
            <img src="${category.featuredPost.image}" alt="${category.featuredPost.title}" />
          </div>
          <div class="featured-content">
            <h3>${category.featuredPost.title}</h3>
            <p>${category.featuredPost.description}</p>
          </div>
        </article>
      `;
    }

    // Tạo danh sách bài viết
    if (category.posts && category.posts.length > 0) {
        const MAX_POSTS = 4; // ← THÊM DÒNG NÀY
        const postsToShow = category.posts.slice(0, MAX_POSTS); // ← THÊM DÒNG NÀY

        html += `<div class="post-list">`;

        for (let i = 0; i < postsToShow.length; i++) {
            // ← SỬA: thay category.posts.length thành postsToShow.length
            const post = postsToShow[i]; // ← SỬA: thay category.posts[i] thành postsToShow[i]
            html += `
          <article class="post-item">
            <div class="post-image">
              <img src="${post.image}" alt="${post.title}" />
            </div>
            <div class="post-content">
              <h4>${post.title}</h4>
              <time datetime="${post.date}">${post.date}</time>
            </div>
          </article>
        `;
        }

        html += `</div>`;
    }

    // THÊM SERVICES-COLUMN VỚI DATA ĐỘNG
    html += `
          </div>
          <div class="services-column" id="category-noi-bat">
            ${createServicesHTML(categoryNoiBat)}
          </div>
        </div>
      </div>
    `;

    return html;
}

// Hàm thêm bài viết vào category nổi bật
function addNoiBatPost(newPost) {
    console.log("➕ Thêm bài viết vào Nổi bật...");

    const category = blogData["noi-bat"];
    category.posts.unshift(newPost);

    // Hiển thị lại category nổi bật
    const section = document.getElementById(category.sectionId);
    if (section) {
        const servicesHTML = createServicesHTML(category);
        section.innerHTML = servicesHTML;
    }

    console.log("✅ Đã thêm vào Nổi bật:", newPost.title);
    return true;
}

// Thêm vào global functions
window.addNoiBatPost = addNoiBatPost;
