// Khai báo biến global
let quill;

// Cấu hình API
const API_URL = 'http://localhost:3000';

// Helper functions
function showError(message) {
    alert(message);
    console.error(message);
}

function showSuccess(message) {
    alert(message);
    console.log(message);
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.disabled = true;
        element.textContent = 'Đang xử lý...';
    }
}

function hideLoading(elementId, originalText = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.disabled = false;
        element.textContent = originalText || element.getAttribute('data-original-text') || 'Lưu';
    }
}

// API helper function
async function apiCall(url, options = {}) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = './login.html';
                return;
            }
            const error = await response.json();
            throw new Error(error.message || 'Có lỗi xảy ra');
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra server đã chạy chưa.');
        }
        throw error;
    }
}

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = './login.html';
        return;
    }

    try {
        const user = await apiCall(`${API_URL}/api/users/me`);
        if (user.role !== 'admin') {
            showError('Bạn không có quyền truy cập trang này');
            localStorage.removeItem('token');
            window.location.href = './login.html';
            return;
        }
        document.getElementById('currentUser').textContent = user.fullName;
    } catch (error) {
        showError('Lỗi xác thực: ' + error.message);
        localStorage.removeItem('token');
        window.location.href = './login.html';
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const data = await apiCall(`${API_URL}/api/dashboard`);
        document.getElementById('totalPosts').textContent = data.totalPosts || 0;
        document.getElementById('monthlyPosts').textContent = data.monthlyPosts || 0;
        document.getElementById('totalViews').textContent = data.totalViews || 0;
        document.getElementById('totalUsers').textContent = data.totalUsers || 0;
    } catch (error) {
        console.error('Lỗi dashboard:', error);
        // Set default values
        document.getElementById('totalPosts').textContent = '0';
        document.getElementById('monthlyPosts').textContent = '0';
        document.getElementById('totalViews').textContent = '0';
        document.getElementById('totalUsers').textContent = '0';
    }
}

// Load posts
async function loadPosts() {
    try {
        const posts = await apiCall(`${API_URL}/api/posts`);
        const tbody = document.getElementById('postsTableBody');
        tbody.innerHTML = '';
        
        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có bài viết nào</td></tr>';
            return;
        }
        
        posts.forEach(post => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${post.title || ''}</td>
                <td>${post.categories ? post.categories.map(cat => cat.name).join(', ') : ''}</td>
                <td>${post.author ? post.author.fullName : ''}</td>
                <td>${post.publishDate ? new Date(post.publishDate).toLocaleDateString('vi-VN') : ''}</td>
                <td><span class="badge bg-success">Đã xuất bản</span></td>
                <td>
                    <button class="btn btn-sm btn-primary edit-post" data-id="${post._id}">Sửa</button>
                    <button class="btn btn-sm btn-danger delete-post" data-id="${post._id}">Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showError('Lỗi khi tải danh sách bài viết: ' + error.message);
        document.getElementById('postsTableBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
    }
}

// Load categories
async function loadCategories() {
    try {
        // Use public API for loading categories to avoid auth issues
        const response = await fetch(`${API_URL}/api/categories/public`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Lỗi khi tải categories');
        }
        
        const categories = data.data || [];
        
        // Update category select
        const categorySelect = document.getElementById('postCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category._id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }

        // Update categories table
        const tbody = document.getElementById('categoriesTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            if (categories.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có danh mục nào</td></tr>';
                return;
            }
            
            categories.forEach(category => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${category.name}</td>
                    <td>${category.description || ''}</td>
                    <td>${category.order || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-category" data-id="${category._id}">Sửa</button>
                        <button class="btn btn-sm btn-danger delete-category" data-id="${category._id}">Xóa</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Load categories error:', error);
        showError('Lỗi khi tải danh sách danh mục: ' + error.message);
    }
}

// Image upload handler for Quill
function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', result.url);
            quill.setSelection(range.index + 1);
        } catch (error) {
            showError('Lỗi upload ảnh: ' + error.message);
        }
    };
}

// Save post
async function savePost() {
    const form = document.getElementById('postForm');
    const postId = form.getAttribute('data-id');
    
    // Get form data
    const title = document.getElementById('postTitle').value.trim();
    const content = quill.root.innerHTML.trim();
    const description = document.getElementById('postDescription').value.trim();
    const categories = Array.from(document.getElementById('postCategory').selectedOptions).map(opt => opt.value);
    const tags = document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const thumbnailFile = document.getElementById('postThumbnail').files[0];

    // Validation
    if (!title) {
        showError('Vui lòng nhập tiêu đề');
        return;
    }
    if (!content || content === '<p><br></p>') {
        showError('Vui lòng nhập nội dung');
        return;
    }
    if (categories.length === 0) {
        showError('Vui lòng chọn ít nhất một danh mục');
        return;
    }

    showLoading('savePostBtn');
    
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (description) formData.append('description', description);
        if (categories.length > 0) formData.append('categories', JSON.stringify(categories));
        if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

        const url = postId ? `${API_URL}/api/posts/${postId}` : `${API_URL}/api/posts`;
        const method = postId ? 'PUT' : 'POST';

        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Lỗi khi lưu bài viết');
        }

        showSuccess(postId ? 'Cập nhật bài viết thành công!' : 'Thêm bài viết thành công!');
        
        // Reset form
        form.reset();
        quill.root.innerHTML = '';
        document.getElementById('thumbnailPreview').innerHTML = '';
        form.removeAttribute('data-id');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('postEditorModal'));
        modal.hide();

        // Reload posts
        loadPosts();
    } catch (error) {
        showError('Lỗi khi lưu bài viết: ' + error.message);
    } finally {
        hideLoading('savePostBtn', 'Lưu bài viết');
    }
}

// Edit post
async function editPost(postId) {
    try {
        const post = await apiCall(`${API_URL}/api/posts/${postId}`);
        
        // Fill form
        document.getElementById('postForm').setAttribute('data-id', postId);
        document.getElementById('postTitle').value = post.title || '';
        document.getElementById('postDescription').value = post.description || '';
        quill.root.innerHTML = post.content || '';
        
        // Select categories
        const categorySelect = document.getElementById('postCategory');
        Array.from(categorySelect.options).forEach(option => {
            option.selected = post.categories && post.categories.some(cat => cat._id === option.value);
        });

        // Fill tags
        document.getElementById('postTags').value = post.tags ? post.tags.join(', ') : '';

        // Show thumbnail
        if (post.thumbnail) {
            document.getElementById('thumbnailPreview').innerHTML = 
                `<img src="${post.thumbnail}" alt="Thumbnail" style="max-width: 200px;">`;
        }

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('postEditorModal'));
        modal.show();
    } catch (error) {
        showError('Lỗi khi tải bài viết: ' + error.message);
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    
    try {
        await apiCall(`${API_URL}/api/posts/${postId}`, { method: 'DELETE' });
        showSuccess('Xóa bài viết thành công!');
        loadPosts();
    } catch (error) {
        showError('Lỗi khi xóa bài viết: ' + error.message);
    }
}

// Save category
async function saveCategory() {
    const form = document.getElementById('categoryForm');
    const categoryId = form.getAttribute('data-id');
    
    const name = document.getElementById('categoryName').value.trim();
    const description = document.getElementById('categoryDescription').value.trim();
    const order = parseInt(document.getElementById('categoryOrder').value) || 0;

    if (!name) {
        showError('Vui lòng nhập tên danh mục');
        return;
    }

    showLoading('saveCategoryBtn');
    
    try {
        const url = categoryId ? `${API_URL}/api/categories/${categoryId}` : `${API_URL}/api/categories`;
        const method = categoryId ? 'PUT' : 'POST';

        await apiCall(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, order })
        });

        showSuccess(categoryId ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryEditorModal'));
        modal.hide();

        // Reload categories
        loadCategories();
    } catch (error) {
        showError('Lỗi khi lưu danh mục: ' + error.message);
    } finally {
        hideLoading('saveCategoryBtn', 'Lưu');
    }
}

// Edit category
async function editCategory(categoryId) {
    try {
        const category = await apiCall(`${API_URL}/api/categories/${categoryId}`);
        
        document.getElementById('categoryForm').setAttribute('data-id', categoryId);
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryOrder').value = category.order || 0;

        const modal = new bootstrap.Modal(document.getElementById('categoryEditorModal'));
        modal.show();
    } catch (error) {
        showError('Lỗi khi tải danh mục: ' + error.message);
    }
}

// Delete category
async function deleteCategory(categoryId) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    
    try {
        await apiCall(`${API_URL}/api/categories/${categoryId}`, { method: 'DELETE' });
        showSuccess('Xóa danh mục thành công!');
        loadCategories();
    } catch (error) {
        showError('Lỗi khi xóa danh mục: ' + error.message);
    }
}

// Save settings
async function saveSettings() {
    showLoading('settingsForm');
    
    try {
        const siteName = document.getElementById('siteName').value.trim();
        const siteDescription = document.getElementById('siteDescription').value.trim();
        const contactEmail = document.getElementById('contactEmail').value.trim();
        const contactPhone = document.getElementById('contactPhone').value.trim();

        // Simulate saving settings (you can implement actual API call)
        setTimeout(() => {
            showSuccess('Lưu cài đặt thành công!');
            hideLoading('settingsForm');
        }, 1000);
    } catch (error) {
        showError('Lỗi khi lưu cài đặt: ' + error.message);
        hideLoading('settingsForm');
    }
}

// Switch page function
function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageId}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update sidebar active state
    document.querySelectorAll('#sidebar li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate corresponding sidebar item
    const sidebarLink = document.querySelector(`#sidebar a[data-page="${pageId}"]`);
    if (sidebarLink) {
        sidebarLink.parentElement.classList.add('active');
    }

    // Load data based on page
    switch(pageId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'users':
            console.log('Users page loaded - to be implemented');
            break;
        case 'media':
            console.log('Media page loaded - to be implemented');
            break;
        case 'settings':
            console.log('Settings page loaded');
            break;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Load initial data
    loadDashboardData();
    loadCategories();
    
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ],
                handlers: {
                    image: imageHandler
                }
            }
        }
    });

    // Event listeners
    document.getElementById('savePostBtn').addEventListener('click', savePost);
    
    document.getElementById('newPostBtn').addEventListener('click', () => {
        document.getElementById('postForm').reset();
        document.getElementById('postForm').removeAttribute('data-id');
        quill.root.innerHTML = '';
        document.getElementById('thumbnailPreview').innerHTML = '';
        
        const modal = new bootstrap.Modal(document.getElementById('postEditorModal'));
        modal.show();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = './login.html';
    });

    // Category events
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener('click', saveCategory);
    }

    const newCategoryBtn = document.getElementById('newCategoryBtn');
    if (newCategoryBtn) {
        newCategoryBtn.addEventListener('click', () => {
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryForm').removeAttribute('data-id');
            
            const modal = new bootstrap.Modal(document.getElementById('categoryEditorModal'));
            modal.show();
        });
    }

    // Handle clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-post')) {
            editPost(e.target.getAttribute('data-id'));
        }
        if (e.target.classList.contains('delete-post')) {
            deletePost(e.target.getAttribute('data-id'));
        }
        if (e.target.classList.contains('edit-category')) {
            editCategory(e.target.getAttribute('data-id'));
        }
        if (e.target.classList.contains('delete-category')) {
            deleteCategory(e.target.getAttribute('data-id'));
        }
    });

    // Sidebar navigation
    document.querySelectorAll('#sidebar a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.getAttribute('data-page');
            switchPage(pageId);
        });
    });

    // Sidebar toggle
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    // Thumbnail preview
    document.getElementById('postThumbnail').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('thumbnailPreview').innerHTML = 
                    `<img src="${e.target.result}" alt="Preview" style="max-width: 200px;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSettings();
        });
    }
}); 