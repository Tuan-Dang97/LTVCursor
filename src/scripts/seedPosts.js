require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/ltvlaw');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Xóa tất cả categories và posts cũ
        await Post.deleteMany({});
        await Category.deleteMany({});
        console.log('🗑️  Cleared all existing data');

        // Tạo categories trước
        const categories = [
            { name: 'Pháp luật doanh nghiệp', slug: 'phap-luat-doanh-nghiep' },
            { name: 'Pháp luật sở hữu trí tuệ', slug: 'so-huu-tri-tue' },
            { name: 'Tư vấn pháp lý', slug: 'tu-van-phap-ly' },
            { name: 'Thủ tục hành chính', slug: 'thu-tuc-hanh-chinh' }
        ];

        let createdCategories = [];
        for (const cat of categories) {
            const newCat = new Category(cat);
            await newCat.save();
            createdCategories.push(newCat);
            console.log(`✅ Created category: ${cat.name}`);
        }

        // Tìm user admin để làm tác giả
        let author = await User.findOne({ role: 'admin' });
        if (!author) {
            console.log('⚠️ No admin user found, creating one...');
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@123', salt);
            
            author = new User({
                username: 'admin',
                email: 'admin@ltvlaw.com',
                password: hashedPassword,
                fullName: 'LTV Law Admin',
                role: 'admin'
            });
            await author.save();
        }

        // Tạo bài viết mẫu
        const samplePosts = [
            // PHÁP LUẬT DOANH NGHIỆP (6 bài)
            {
                title: 'Hướng dẫn thành lập công ty TNHH một thành viên',
                slug: 'huong-dan-thanh-lap-cong-ty-tnhh-mot-thanh-vien',
                description: 'Tất cả những điều bạn cần biết về thủ tục thành lập công ty TNHH một thành viên từ A đến Z.',
                content: `<h2>Thành lập công ty TNHH một thành viên</h2><p>Công ty TNHH một thành viên là loại hình doanh nghiệp phổ biến nhất tại Việt Nam hiện nay...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[0]._id],
                tags: ['thành lập công ty', 'TNHH', 'doanh nghiệp'],
                author: author._id,
                viewCount: 120,
                featured: true
            },
            {
                title: 'Các loại hình doanh nghiệp và ưu nhược điểm',
                slug: 'cac-loai-hinh-doanh-nghiep-va-uu-nhuoc-diem',
                description: 'Phân tích chi tiết các loại hình doanh nghiệp tại Việt Nam: TNHH, Cổ phần, Hợp danh, Tư nhân.',
                content: `<h2>Các loại hình doanh nghiệp tại Việt Nam</h2><p>Hiện nay pháp luật Việt Nam quy định 4 loại hình doanh nghiệp chính...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[0]._id],
                tags: ['loại hình doanh nghiệp', 'TNHH', 'cổ phần'],
                author: author._id,
                viewCount: 95
            },
            {
                title: 'Cách tính thuế thu nhập doanh nghiệp 2025',
                slug: 'cach-tinh-thue-thu-nhap-doanh-nghiep-2025',
                description: 'Hướng dẫn cách tính thuế thu nhập doanh nghiệp, các mức ưu đãi và khấu trừ hợp pháp năm 2025.',
                content: `<h2>Thuế thu nhập doanh nghiệp 2025</h2><p>Thuế thu nhập doanh nghiệp là khoản thuế bắt buộc mà mọi doanh nghiệp phải nộp...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[0]._id],
                tags: ['thuế', 'doanh nghiệp', 'kế toán'],
                author: author._id,
                viewCount: 110
            },
            {
                title: 'Thủ tục tăng vốn điều lệ công ty',
                slug: 'thu-tuc-tang-von-dieu-le-cong-ty',
                description: 'Hướng dẫn chi tiết thủ tục tăng vốn điều lệ cho công ty TNHH và công ty cổ phần.',
                content: `<h2>Tăng vốn điều lệ công ty</h2><p>Tăng vốn điều lệ là việc công ty tăng số vốn đã đăng ký ban đầu để mở rộng hoạt động kinh doanh...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[0]._id],
                tags: ['tăng vốn', 'điều lệ', 'thủ tục'],
                author: author._id,
                viewCount: 78
            },
            {
                title: 'Quyền và nghĩa vụ của thành viên công ty TNHH',
                slug: 'quyen-va-nghia-vu-thanh-vien-cong-ty-tnhh',
                description: 'Tìm hiểu về quyền và nghĩa vụ của thành viên trong công ty TNHH theo pháp luật hiện hành.',
                content: `<h2>Quyền và nghĩa vụ thành viên TNHH</h2><p>Thành viên công ty TNHH có những quyền và nghĩa vụ được quy định rõ trong Luật Doanh nghiệp...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[0]._id],
                tags: ['thành viên', 'quyền nghĩa vụ', 'TNHH'],
                author: author._id,
                viewCount: 67
            },
            {
                title: 'Thủ tục giải thể doanh nghiệp tự nguyện',
                slug: 'thu-tuc-giai-the-doanh-nghiep-tu-nguyen',
                description: 'Hướng dẫn thủ tục giải thể doanh nghiệp tự nguyện và các vấn đề pháp lý liên quan.',
                content: `<h2>Giải thể doanh nghiệp tự nguyện</h2><p>Giải thể doanh nghiệp là việc chấm dứt hoạt động và tồn tại pháp lý của doanh nghiệp...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[0]._id],
                tags: ['giải thể', 'doanh nghiệp', 'tự nguyện'],
                author: author._id,
                viewCount: 55
            },

            // PHÁP LUẬT SỞ HỮU TRÍ TUỆ (6 bài)
            {
                title: 'Quy trình đăng ký bảo hộ thương hiệu',
                slug: 'quy-trinh-dang-ky-bao-ho-thuong-hieu',
                description: 'Hướng dẫn chi tiết quy trình đăng ký bảo hộ thương hiệu tại Việt Nam từ A đến Z.',
                content: `<h2>Đăng ký bảo hộ thương hiệu</h2><p>Thương hiệu là tài sản vô hình quan trọng của doanh nghiệp...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[1]._id],
                tags: ['thương hiệu', 'sở hữu trí tuệ', 'bảo hộ'],
                author: author._id,
                viewCount: 85,
                featured: true
            },
            {
                title: 'Bảo vệ bản quyền tác phẩm văn học nghệ thuật',
                slug: 'bao-ve-ban-quyen-tac-pham-van-hoc-nghe-thuat',
                description: 'Cách thức bảo vệ bản quyền tác phẩm văn học, nghệ thuật và quyền tác giả theo pháp luật.',
                content: `<h2>Bảo vệ bản quyền tác phẩm</h2><p>Bản quyền tác giả được bảo vệ tự động từ khi tác phẩm được tạo ra...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[1]._id],
                tags: ['bản quyền', 'tác phẩm', 'văn học nghệ thuật'],
                author: author._id,
                viewCount: 72
            },
            {
                title: 'Đăng ký sáng chế và giải pháp hữu ích',
                slug: 'dang-ky-sang-che-va-giai-phap-huu-ich',
                description: 'Hướng dẫn thủ tục đăng ký sáng chế, giải pháp hữu ích để bảo vệ phát minh sáng tạo.',
                content: `<h2>Đăng ký sáng chế</h2><p>Sáng chế là giải pháp kỹ thuật dưới dạng sản phẩm hoặc quy trình có tính mới...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[1]._id],
                tags: ['sáng chế', 'giải pháp hữu ích', 'phát minh'],
                author: author._id,
                viewCount: 61
            },
            {
                title: 'Chỉ dẫn địa lý - Bảo hộ đặc sản vùng miền',
                slug: 'chi-dan-dia-ly-bao-ho-dac-san-vung-mien',
                description: 'Tìm hiểu về chỉ dẫn địa lý và cách đăng ký bảo hộ đặc sản, sản phẩm truyền thống.',
                content: `<h2>Chỉ dẫn địa lý</h2><p>Chỉ dẫn địa lý là dấu hiệu dùng để xác định hàng hóa có nguồn gốc từ một vùng địa lý...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[1]._id],
                tags: ['chỉ dẫn địa lý', 'đặc sản', 'truyền thống'],
                author: author._id,
                viewCount: 48
            },
            {
                title: 'Bảo vệ kiểu dáng công nghiệp',
                slug: 'bao-ve-kieu-dang-cong-nghiep',
                description: 'Hướng dẫn đăng ký bảo hộ kiểu dáng công nghiệp cho sản phẩm, thiết kế độc quyền.',
                content: `<h2>Kiểu dáng công nghiệp</h2><p>Kiểu dáng công nghiệp là dạng hình thể hiện bên ngoài của sản phẩm...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[1]._id],
                tags: ['kiểu dáng', 'công nghiệp', 'thiết kế'],
                author: author._id,
                viewCount: 39
            },
            {
                title: 'Vi phạm sở hữu trí tuệ và cách xử lý',
                slug: 'vi-pham-so-huu-tri-tue-va-cach-xu-ly',
                description: 'Các hành vi vi phạm sở hữu trí tuệ phổ biến và biện pháp xử lý theo quy định pháp luật.',
                content: `<h2>Vi phạm sở hữu trí tuệ</h2><p>Vi phạm quyền sở hữu trí tuệ gồm nhiều hành vi khác nhau như làm giả, sao chép trái phép...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[1]._id],
                tags: ['vi phạm', 'xử lý', 'pháp luật'],
                author: author._id,
                viewCount: 92
            },

            // Tư VẤN PHÁP LÝ (6 bài)
            {
                title: 'Tư vấn pháp lý cho startup',
                slug: 'tu-van-phap-ly-cho-startup',
                description: 'Những vấn đề pháp lý quan trọng mà startup cần lưu ý từ khâu thành lập đến vận hành.',
                content: `<h2>Pháp lý cho Startup</h2><p>Startup cần đặc biệt chú ý đến các vấn đề pháp lý để tránh rủi ro...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[2]._id],
                tags: ['startup', 'tư vấn pháp lý', 'doanh nghiệp'],
                author: author._id,
                viewCount: 65
            },
            {
                title: 'Hợp đồng lao động - Những điều cần biết',
                slug: 'hop-dong-lao-dong-nhung-dieu-can-biet',
                description: 'Tư vấn về hợp đồng lao động, quyền lợi người lao động và nghĩa vụ của người sử dụng lao động.',
                content: `<h2>Hợp đồng lao động</h2><p>Hợp đồng lao động là thỏa thuận giữa người lao động và người sử dụng lao động...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[2]._id],
                tags: ['hợp đồng lao động', 'quyền lợi', 'lao động'],
                author: author._id,
                viewCount: 88
            },
            {
                title: 'Tư vấn tranh chấp hợp đồng thương mại',
                slug: 'tu-van-tranh-chap-hop-dong-thuong-mai',
                description: 'Cách giải quyết tranh chấp hợp đồng thương mại, thương lượng và kiện tụng dân sự.',
                content: `<h2>Tranh chấp hợp đồng thương mại</h2><p>Tranh chấp hợp đồng là vấn đề phổ biến trong kinh doanh...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[2]._id],
                tags: ['tranh chấp', 'hợp đồng', 'thương mại'],
                author: author._id,
                viewCount: 74
            },
            {
                title: 'Tư vấn pháp luật đầu tư nước ngoài',
                slug: 'tu-van-phap-luat-dau-tu-nuoc-ngoai',
                description: 'Hướng dẫn các quy định pháp luật về đầu tư nước ngoài tại Việt Nam.',
                content: `<h2>Đầu tư nước ngoài</h2><p>Pháp luật đầu tư nước ngoài tại Việt Nam được quy định trong Luật Đầu tư...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[2]._id],
                tags: ['đầu tư', 'nước ngoài', 'FDI'],
                author: author._id,
                viewCount: 56
            },
            {
                title: 'Tư vấn thừa kế di sản',
                slug: 'tu-van-thua-ke-di-san',
                description: 'Quy định pháp luật về thừa kế di sản, phân chia tài sản và giải quyết tranh chấp.',
                content: `<h2>Thừa kế di sản</h2><p>Thừa kế là việc chuyển giao tài sản của người đã chết cho những người thừa kế...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[2]._id],
                tags: ['thừa kế', 'di sản', 'tài sản'],
                author: author._id,
                viewCount: 63
            },
            {
                title: 'Tư vấn pháp lý bất động sản',
                slug: 'tu-van-phap-ly-bat-dong-san',
                description: 'Các vấn đề pháp lý cần lưu ý khi mua bán, chuyển nhượng bất động sản.',
                content: `<h2>Pháp lý bất động sản</h2><p>Giao dịch bất động sản cần tuân thủ nhiều quy định pháp luật phức tạp...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[2]._id],
                tags: ['bất động sản', 'mua bán', 'chuyển nhượng'],
                author: author._id,
                viewCount: 97
            },

            // THỦ TỤC HÀNH CHÍNH (6 bài)
            {
                title: 'Thủ tục đăng ký kinh doanh online',
                slug: 'thu-tuc-dang-ky-kinh-doanh-online',
                description: 'Hướng dẫn đăng ký kinh doanh qua mạng - nhanh chóng, tiện lợi, tiết kiệm thời gian.',
                content: `<h2>Đăng ký kinh doanh online</h2><p>Từ năm 2020, Việt Nam đã triển khai dịch vụ đăng ký kinh doanh trực tuyến...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[3]._id],
                tags: ['đăng ký online', 'thủ tục hành chính', 'chuyển đổi số'],
                author: author._id,
                viewCount: 76
            },
            {
                title: 'Thủ tục xin giấy phép đầu tư',
                slug: 'thu-tuc-xin-giay-phep-dau-tu',
                description: 'Hướng dẫn thủ tục xin cấp giấy chứng nhận đầu tư cho dự án đầu tư trong nước.',
                content: `<h2>Giấy phép đầu tư</h2><p>Giấy chứng nhận đầu tư là văn bản pháp lý xác nhận việc được phép thực hiện dự án đầu tư...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[3]._id],
                tags: ['giấy phép đầu tư', 'thủ tục', 'dự án'],
                author: author._id,
                viewCount: 54
            },
            {
                title: 'Thủ tục cấp phép xây dựng',
                slug: 'thu-tuc-cap-phep-xay-dung',
                description: 'Quy trình xin cấp giấy phép xây dựng cho nhà ở, công trình dân dụng và công nghiệp.',
                content: `<h2>Giấy phép xây dựng</h2><p>Giấy phép xây dựng là văn bản cho phép chủ đầu tư được xây dựng công trình...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[3]._id],
                tags: ['giấy phép xây dựng', 'xây dựng', 'công trình'],
                author: author._id,
                viewCount: 68
            },
            {
                title: 'Thủ tục đăng ký kết hôn',
                slug: 'thu-tuc-dang-ky-ket-hon',
                description: 'Hướng dẫn thủ tục đăng ký kết hôn, điều kiện và hồ sơ cần thiết theo quy định.',
                content: `<h2>Đăng ký kết hôn</h2><p>Đăng ký kết hôn là thủ tục hành chính để nhà nước công nhận hôn nhân hợp pháp...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[3]._id],
                tags: ['đăng ký kết hôn', 'hôn nhân', 'gia đình'],
                author: author._id,
                viewCount: 125
            },
            {
                title: 'Thủ tục làm căn cước công dân',
                slug: 'thu-tuc-lam-can-cuoc-cong-dan',
                description: 'Quy trình làm căn cước công dân lần đầu, đổi, cấp lại và cập nhật thông tin.',
                content: `<h2>Căn cước công dân</h2><p>Căn cước công dân là giấy tờ tùy thân quan trọng của mọi công dân Việt Nam...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[3]._id],
                tags: ['căn cước công dân', 'CCCD', 'tùy thân'],
                author: author._id,
                viewCount: 143
            },
            {
                title: 'Thủ tục xin visa du lịch',
                slug: 'thu-tuc-xin-visa-du-lich',
                description: 'Hướng dẫn thủ tục xin visa du lịch các nước phổ biến dành cho công dân Việt Nam.',
                content: `<h2>Visa du lịch</h2><p>Visa là giấy phép nhập cảnh được cấp bởi cơ quan có thẩm quyền của nước nhận...</p>`,
                thumbnail: '/image/thanh-lap-cong-ty-co-phan.jpg',
                categories: [createdCategories[3]._id],
                tags: ['visa', 'du lịch', 'xuất nhập cảnh'],
                author: author._id,
                viewCount: 89
            }
        ];

        // Tạo bài viết mới
        for (const postData of samplePosts) {
            const post = new Post(postData);
            await post.save();
            console.log(`✅ Created post: ${postData.title}`);
        }

        console.log(`\n🎉 Successfully created ${samplePosts.length} sample posts!`);
        console.log('📍 Website should now display content properly');

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedData(); 