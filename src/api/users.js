const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Reset admin account
router.post('/reset-admin', async (req, res) => {
    try {
        // Xóa tất cả tài khoản admin cũ
        await User.deleteMany({ role: 'admin' });

        // Hash password
        const plainPassword = 'Admin@123'; // Password mặc định
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // Tạo admin mới
        const admin = new User({
            username: 'admin',
            email: 'admin@ltvlaw.com',
            password: hashedPassword,
            fullName: 'Admin LTV',
            role: 'admin'
        });

        await admin.save();

        res.json({
            message: 'Đã reset tài khoản admin',
            credentials: {
                email: 'admin@ltvlaw.com',
                password: plainPassword
            }
        });
    } catch (error) {
        console.error('Reset admin error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Đăng ký tài khoản
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        // Kiểm tra user đã tồn tại
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email hoặc username đã tồn tại' });
        }

        // Tạo user mới
        const user = new User({
            username,
            email,
            password, // password sẽ được hash trong mongoose middleware
            fullName
        });

        await user.save();

        res.status(201).json({
            message: 'Đăng ký thành công',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email }); // Log thông tin đăng nhập

        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        console.log('Found user:', { 
            email: user.email, 
            role: user.role,
            passwordLength: user.password.length 
        });

        // Kiểm tra password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Lấy thông tin user hiện tại
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Cập nhật thông tin user
router.put('/me', auth, async (req, res) => {
    try {
        const { fullName, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (fullName) user.fullName = fullName;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            message: 'Cập nhật thành công',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Admin: Lấy danh sách users
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Admin: Xóa user
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa user thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = router; 