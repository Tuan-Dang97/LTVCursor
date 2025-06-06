const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { 
    register,
    login,
    getProfile,
    updateProfile,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);

// Admin routes
router.get('/', auth, admin, getUsers);
router.get('/:id', auth, admin, getUserById);
router.put('/:id', auth, admin, updateUser);
router.delete('/:id', auth, admin, deleteUser);

module.exports = router; 