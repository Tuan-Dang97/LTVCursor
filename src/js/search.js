// Khởi tạo biến lưu trữ dữ liệu tìm kiếm
let searchData = [];

// Hàm tải dữ liệu bài viết
async function loadSearchData() {
    try {
        const response = await fetch('/data/posts.json');
        searchData = await response.json();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu tìm kiếm:', error);
    }
}

// Hàm tìm kiếm
function searchPosts(keyword) {
    return searchData.filter(post => {
        const searchString = `${post.title} ${post.description} ${post.categories.join(' ')}`.toLowerCase();
        return searchString.includes(keyword.toLowerCase());
    });
}

// Hàm hiển thị kết quả tìm kiếm
function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = '<p>Không tìm thấy kết quả nào</p>';
        return;
    }

    const resultsList = document.createElement('ul');
    results.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="${post.url}">
                <h3>${post.title}</h3>
                <p>${post.description}</p>
            </a>
        `;
        resultsList.appendChild(li);
    });
    searchResults.appendChild(resultsList);
}

// Xử lý sự kiện tìm kiếm
document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const keyword = document.getElementById('search-input').value;
    const results = searchPosts(keyword);
    displaySearchResults(results);
});

// Tải dữ liệu khi trang web được tải
document.addEventListener('DOMContentLoaded', loadSearchData); 