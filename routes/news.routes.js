import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../utils/multer.js';
import {
    AdminCreateNews,
    AdminUpdateNews,
    AdminGetNews,
    AdminGetAllNews,
    AdminDeleteNews,
} from '../controllers/news.controller.js';

const router = express.Router();

// Admin routes with authentication and file upload
router.route('/')
    .post(upload.single('banner'), AdminCreateNews) // Create blog with banner upload
    .get(AdminGetAllNews); // Get all blogs

router.route('/:id')
    .get(AdminGetNews) // Get single blog
    .put(upload.single('banner'), AdminUpdateNews) // Update blog with optional banner upload
    .delete(AdminDeleteNews); // Delete blog

export default router;