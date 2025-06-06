const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getPostsByCategory,
    searchPosts
} = require('../controllers/postController');

// Public routes
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/category/:categoryId', getPostsByCategory);
router.get('/:id', getPostById);

// Protected routes
router.post('/', auth, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router; 