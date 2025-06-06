// Kiểm tra authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    // Hiển thị thông tin user
    fetch('/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(user => {
        document.getElementById('currentUser').textContent = user.fullName;
    })
    .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/admin/login.html';
    });
}

// Xử lý đăng xuất
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login.html';
});

// Xử lý toggle sidebar
document.getElementById('sidebarCollapse').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

// Load danh sách media
async function loadMedia(params = {}) {
    try {
        const token = localStorage.getItem('token');
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`/api/media?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const media = await response.json();
        renderMedia(media);
    } catch (error) {
        console.error('Lỗi khi tải media:', error);
    }
}

// Render grid media
function renderMedia(media) {
    const grid = document.getElementById('mediaGrid');
    grid.innerHTML = '';

    media.forEach(item => {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.innerHTML = `
            <div class="media-thumbnail">
                <img src="${item.url}" alt="${item.alt || item.name}">
            </div>
            <div class="media-info">
                <div class="media-name">${item.name}</div>
                <div class="media-meta">${formatFileSize(item.size)}</div>
            </div>
            <div class="media-actions">
                <button class="btn btn-sm btn-outline-primary preview-btn" data-id="${item._id}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${item._id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(div);
    });
}

// Format kích thước file
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Xử lý upload file
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const progressBar = document.getElementById('uploadProgress');
const progressBarInner = progressBar.querySelector('.progress-bar');

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

async function handleFiles(files) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    for (let file of files) {
        formData.append('files', file);
    }

    progressBar.style.display = 'block';
    progressBarInner.style.width = '0%';

    try {
        const response = await fetch('/api/media/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            progressBarInner.style.width = '100%';
            setTimeout(() => {
                progressBar.style.display = 'none';
                loadMedia();
            }, 1000);
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Lỗi khi upload:', error);
        progressBar.style.display = 'none';
        alert('Lỗi khi tải file lên');
    }
}

// Xử lý preview
const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
let currentMediaId = null;

document.addEventListener('click', async (e) => {
    const previewBtn = e.target.closest('.preview-btn');
    if (previewBtn) {
        const mediaId = previewBtn.dataset.id;
        currentMediaId = mediaId;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/media/${mediaId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const media = await response.json();
            
            document.getElementById('previewImage').src = media.url;
            document.getElementById('fileName').value = media.name;
            document.getElementById('fileAlt').value = media.alt || '';
            document.getElementById('fileUrl').value = media.url;
            document.getElementById('fileSize').textContent = formatFileSize(media.size);
            document.getElementById('fileDate').textContent = new Date(media.createdAt).toLocaleString();
            
            previewModal.show();
        } catch (error) {
            console.error('Lỗi khi tải thông tin media:', error);
        }
    }
});

// Copy URL
document.getElementById('copyUrl').addEventListener('click', () => {
    const urlInput = document.getElementById('fileUrl');
    urlInput.select();
    document.execCommand('copy');
});

// Lưu thay đổi
document.getElementById('saveFile').addEventListener('click', async () => {
    if (!currentMediaId) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/media/${currentMediaId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: document.getElementById('fileName').value,
                alt: document.getElementById('fileAlt').value
            })
        });

        if (response.ok) {
            previewModal.hide();
            loadMedia();
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
        alert('Lỗi khi lưu thay đổi');
    }
});

// Xóa file
document.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-btn, #deleteFile');
    if (deleteBtn) {
        const mediaId = deleteBtn.dataset.id || currentMediaId;
        if (!mediaId) return;
        
        if (!confirm('Bạn có chắc chắn muốn xóa file này?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/media/${mediaId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                previewModal.hide();
                loadMedia();
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
            alert('Lỗi khi xóa file');
        }
    }
});

// Xử lý tìm kiếm
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const params = {
            search: e.target.value,
            type: document.getElementById('typeFilter').value,
            sort: document.getElementById('sortFilter').value
        };
        loadMedia(params);
    }, 300);
});

// Xử lý filter
document.getElementById('typeFilter').addEventListener('change', (e) => {
    const params = {
        search: document.getElementById('searchInput').value,
        type: e.target.value,
        sort: document.getElementById('sortFilter').value
    };
    loadMedia(params);
});

document.getElementById('sortFilter').addEventListener('change', (e) => {
    const params = {
        search: document.getElementById('searchInput').value,
        type: document.getElementById('typeFilter').value,
        sort: e.target.value
    };
    loadMedia(params);
});

// Khởi tạo
checkAuth();
loadMedia(); 