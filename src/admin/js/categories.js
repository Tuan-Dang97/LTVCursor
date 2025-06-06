// Kiểm tra authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('./login.html');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Auth check failed');
        }

        const user = await response.json();
        if (user.role !== 'admin') {
            throw new Error('Unauthorized: Requires admin role');
        }

        document.getElementById('currentUser').textContent = user.fullName;
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        window.location.replace('./login.html');
    }
}

// Xử lý đăng xuất
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.replace('./login.html');
});

// Xử lý toggle sidebar
document.getElementById('sidebarCollapse').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

// Render cây danh mục
function renderCategoryTree(categories, parentElement = document.getElementById('categoryTree')) {
    parentElement.innerHTML = '';
    
    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.innerHTML = `
            <div class="category-info">
                <i class="bi bi-grip-vertical drag-handle"></i>
                <span class="category-name">${category.name}</span>
                <span class="category-meta">${category.postCount || 0} bài viết</span>
                <div class="category-actions">
                    <button class="btn btn-sm btn-outline-primary edit-category" data-id="${category._id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-category" data-id="${category._id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;

        if (category.children && category.children.length > 0) {
            const ul = document.createElement('ul');
            ul.className = 'category-tree category-children';
            li.appendChild(ul);
            renderCategoryTree(category.children, ul);
        }

        parentElement.appendChild(li);
    });

    // Khởi tạo drag & drop
    new Sortable(parentElement, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        handle: '.drag-handle',
        onEnd: function(evt) {
            const item = evt.item;
            const parent = item.parentElement;
            const categories = Array.from(parent.children).map((li, index) => ({
                id: li.querySelector('[data-id]').dataset.id,
                order: index
            }));
            
            updateCategoryOrder(categories);
        }
    });
}

// Load danh mục
async function loadCategories() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/categories', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const categories = await response.json();
        
        const tbody = document.getElementById('categoriesTableBody');
        tbody.innerHTML = '';
        
        categories.forEach(category => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${category.name}</td>
                <td>${category.slug}</td>
                <td>${category.description || ''}</td>
                <td>${category.postCount || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-category" data-id="${category._id}">Sửa</button>
                    <button class="btn btn-sm btn-danger delete-category" data-id="${category._id}">Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách danh mục:', error);
    }
}

// Tự động tạo slug từ tên danh mục
document.getElementById('categoryName').addEventListener('input', (e) => {
    const name = e.target.value;
    const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    document.getElementById('categorySlug').value = slug;
});

// Xử lý thêm/sửa danh mục
document.getElementById('saveCategoryBtn').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token');
        const categoryId = document.getElementById('categoryForm').getAttribute('data-id');
        const formData = {
            name: document.getElementById('categoryName').value,
            slug: document.getElementById('categorySlug').value,
            description: document.getElementById('categoryDescription').value
        };

        const url = categoryId 
            ? `http://localhost:3000/api/categories/${categoryId}`
            : 'http://localhost:3000/api/categories';
        const method = categoryId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            loadCategories();
            // Reset form
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryForm').removeAttribute('data-id');
        } else {
            throw new Error('Lỗi khi lưu danh mục');
        }
    } catch (error) {
        console.error('Lỗi khi lưu danh mục:', error);
        alert('Có lỗi xảy ra khi lưu danh mục');
    }
});

// Xử lý xóa danh mục
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-category')) {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const categoryId = e.target.getAttribute('data-id');
            
            const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                loadCategories();
            } else {
                throw new Error('Lỗi khi xóa danh mục');
            }
        } catch (error) {
            console.error('Lỗi khi xóa danh mục:', error);
            alert('Có lỗi xảy ra khi xóa danh mục');
        }
    }
});

// Xử lý sửa danh mục
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit-category')) {
        try {
            const token = localStorage.getItem('token');
            const categoryId = e.target.getAttribute('data-id');
            
            const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const category = await response.json();
                
                // Điền thông tin vào form
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categorySlug').value = category.slug;
                document.getElementById('categoryDescription').value = category.description || '';
                document.getElementById('categoryForm').setAttribute('data-id', category._id);
                
                // Hiển thị modal
                new bootstrap.Modal(document.getElementById('categoryModal')).show();
            } else {
                throw new Error('Lỗi khi tải thông tin danh mục');
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin danh mục:', error);
            alert('Có lỗi xảy ra khi tải thông tin danh mục');
        }
    }
});

// Reset form khi mở modal thêm mới
document.querySelector('[data-bs-target="#categoryModal"]').addEventListener('click', () => {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryForm').removeAttribute('data-id');
});

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCategories();
}); 