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
        
        // Điền thông tin vào form
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('email').value = user.email;
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

// Xử lý cập nhật thông tin cá nhân
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value
        };

        const response = await fetch('http://localhost:3000/api/users/me', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Cập nhật thông tin thành công');
            checkAuth(); // Refresh thông tin
        } else {
            throw new Error('Lỗi khi cập nhật thông tin');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        alert('Có lỗi xảy ra khi cập nhật thông tin');
    }
});

// Xử lý đổi mật khẩu
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Mật khẩu mới không khớp');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users/change-password', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (response.ok) {
            alert('Đổi mật khẩu thành công');
            document.getElementById('passwordForm').reset();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Lỗi khi đổi mật khẩu');
        }
    } catch (error) {
        console.error('Change password error:', error);
        alert(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
});

// Xử lý toggle sidebar
document.getElementById('sidebarCollapse').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

// Load cấu hình SEO
async function loadSEOConfig() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/seo/config', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const config = await response.json();
        
        // Điền dữ liệu vào form
        const form = document.getElementById('seoForm');
        
        // Điền các trường cơ bản
        form.elements['siteName'].value = config.siteName;
        form.elements['defaultTitle'].value = config.defaultTitle;
        form.elements['defaultDescription'].value = config.defaultDescription;
        form.elements['defaultKeywords'].value = config.defaultKeywords.join(', ');
        form.elements['favicon'].value = config.favicon;
        form.elements['logo'].value = config.logo;
        form.elements['socialImage'].value = config.socialImage;
        form.elements['robots'].value = config.robots;
        form.elements['canonicalUrl'].value = config.canonicalUrl;
        
        // Điền tracking IDs
        form.elements['googleAnalyticsId'].value = config.googleAnalyticsId || '';
        form.elements['facebookPixelId'].value = config.facebookPixelId || '';
        form.elements['facebookAppId'].value = config.facebookAppId || '';
        
        // Điền thông tin tổ chức
        if (config.structuredData?.organization) {
            const org = config.structuredData.organization;
            form.elements['organization.name'].value = org.name || '';
            form.elements['organization.logo'].value = org.logo || '';
            form.elements['organization.address'].value = org.address || '';
            form.elements['organization.phone'].value = org.phone || '';
            form.elements['organization.email'].value = org.email || '';
            
            // Điền social links
            if (org.socialLinks?.length > 0) {
                const container = document.getElementById('socialLinks');
                container.innerHTML = ''; // Xóa mẫu mặc định
                
                org.socialLinks.forEach(link => {
                    addSocialLink(link.platform, link.url);
                });
            }
        }
        
        // Điền custom meta tags
        if (config.customMetaTags?.length > 0) {
            const container = document.getElementById('customMetaTags');
            container.innerHTML = ''; // Xóa mẫu mặc định
            
            config.customMetaTags.forEach(meta => {
                addCustomMeta(meta.name, meta.content);
            });
        }
    } catch (error) {
        console.error('Lỗi khi tải cấu hình SEO:', error);
    }
}

// Thêm social link
function addSocialLink(platform = '', url = '') {
    const container = document.getElementById('socialLinks');
    const div = document.createElement('div');
    div.className = 'social-link-item mb-2';
    div.innerHTML = `
        <div class="input-group">
            <select class="form-select" style="width: 150px;">
                <option value="facebook" ${platform === 'facebook' ? 'selected' : ''}>Facebook</option>
                <option value="twitter" ${platform === 'twitter' ? 'selected' : ''}>Twitter</option>
                <option value="linkedin" ${platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                <option value="youtube" ${platform === 'youtube' ? 'selected' : ''}>YouTube</option>
            </select>
            <input type="url" class="form-control" placeholder="URL" value="${url}">
            <button class="btn btn-outline-danger" type="button" onclick="removeSocialLink(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
}

// Xóa social link
function removeSocialLink(button) {
    button.closest('.social-link-item').remove();
}

// Thêm custom meta tag
function addCustomMeta(name = '', content = '') {
    const container = document.getElementById('customMetaTags');
    const div = document.createElement('div');
    div.className = 'custom-meta-item mb-2';
    div.innerHTML = `
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Name" style="width: 150px;" value="${name}">
            <input type="text" class="form-control" placeholder="Content" value="${content}">
            <button class="btn btn-outline-danger" type="button" onclick="removeCustomMeta(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
}

// Xóa custom meta tag
function removeCustomMeta(button) {
    button.closest('.custom-meta-item').remove();
}

// Media picker
let currentMediaField = null;
const mediaPickerModal = new bootstrap.Modal(document.getElementById('mediaPickerModal'));

function openMediaPicker(fieldName) {
    currentMediaField = fieldName;
    loadMedia();
    mediaPickerModal.show();
}

// Load media cho picker
async function loadMedia() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/media?type=image', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const media = await response.json();
        
        const grid = document.getElementById('mediaGrid');
        grid.innerHTML = '';
        
        media.forEach(item => {
            const div = document.createElement('div');
            div.className = 'media-item';
            div.style.cursor = 'pointer';
            div.innerHTML = `
                <div class="media-thumbnail">
                    <img src="${item.url}" alt="${item.name}">
                </div>
            `;
            div.addEventListener('click', () => {
                selectMedia(item);
            });
            grid.appendChild(div);
        });
    } catch (error) {
        console.error('Lỗi khi tải media:', error);
    }
}

// Chọn media
function selectMedia(media) {
    if (!currentMediaField) return;
    
    // Tìm input field
    const input = document.querySelector(`[name="${currentMediaField}"]`);
    if (input) {
        input.value = media.url;
    }
    
    mediaPickerModal.hide();
}

// Xử lý submit form
document.getElementById('seoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const form = e.target;
        const formData = {
            siteName: form.elements['siteName'].value,
            defaultTitle: form.elements['defaultTitle'].value,
            defaultDescription: form.elements['defaultDescription'].value,
            defaultKeywords: form.elements['defaultKeywords'].value.split(',').map(k => k.trim()),
            favicon: form.elements['favicon'].value,
            logo: form.elements['logo'].value,
            socialImage: form.elements['socialImage'].value,
            robots: form.elements['robots'].value,
            canonicalUrl: form.elements['canonicalUrl'].value,
            googleAnalyticsId: form.elements['googleAnalyticsId'].value,
            facebookPixelId: form.elements['facebookPixelId'].value,
            facebookAppId: form.elements['facebookAppId'].value,
            
            // Thông tin tổ chức
            organization: {
                name: form.elements['organization.name'].value,
                logo: form.elements['organization.logo'].value,
                address: form.elements['organization.address'].value,
                phone: form.elements['organization.phone'].value,
                email: form.elements['organization.email'].value,
                socialLinks: Array.from(document.querySelectorAll('.social-link-item')).map(item => ({
                    platform: item.querySelector('select').value,
                    url: item.querySelector('input[type="url"]').value
                }))
            },
            
            // Custom meta tags
            customMetaTags: Array.from(document.querySelectorAll('.custom-meta-item')).map(item => {
                const inputs = item.querySelectorAll('input');
                return {
                    name: inputs[0].value,
                    content: inputs[1].value
                };
            })
        };

        const token = localStorage.getItem('token');
        const response = await fetch('/api/seo/config', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Đã lưu cấu hình SEO thành công');
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật cấu hình SEO:', error);
        alert('Lỗi khi lưu cấu hình SEO');
    }
});

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSEOConfig();
}); 