import { defineConfig } from "vite";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import path from "path";
import { resolve } from 'path';

export default defineConfig({
    // Đường dẫn gốc khi deploy (gh-pages cần đúng path)
    base: process.env.NODE_ENV === "production" ? "/LTVLaw-12-5-2025" : "/",

    // Thư mục chính chứa HTML, SCSS, JS
    root: "src",

    // Thư mục chứa các file tĩnh như ảnh, fonts, v.v.
    publicDir: "../public",

    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },

    build: {
        // Nơi xuất ra sản phẩm sau khi build
        outDir: "../dist",
        emptyOutDir: true,

        // Khai báo các trang cần build (nhiều trang)
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, "src/index.html"),
                about: path.resolve(__dirname, "src/about.html"),
                article: path.resolve(__dirname, "src/article-template.html"),
                blog: path.resolve(__dirname, "src/blog.html"),
                client: path.resolve(__dirname, "src/client-stores.html"),
                recruitment: path.resolve(__dirname, "src/recruitment.html"),
                category: path.resolve(
                    __dirname,
                    "src/categories/bai-viet-moi.html"
                ),
                main: resolve(__dirname, 'index.html'),
                "admin-login": path.resolve(__dirname, "src/admin/login.html"),
                "admin-dashboard": path.resolve(__dirname, "src/admin/index.html"),
                "admin-media": path.resolve(__dirname, "src/admin/media.html"),
                "admin-categories": path.resolve(__dirname, "src/admin/categories.html"),
                "admin-settings": path.resolve(__dirname, "src/admin/settings.html"),
            },
        },
    },

    plugins: [
        ViteEjsPlugin()
    ]
});
