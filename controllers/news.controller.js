import { ErrorHandler, TryCatch } from '../error/error.js';
import { News } from '../models/news.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// Create a new News
export const AdminCreateNews = TryCatch(async (req, res, next) => {
    const { title, description, content } = req.body;

    if (!title || !description || !content) {
        return next(new ErrorHandler('Please provide all required fields', 400));
    }

    let banner = {};
    if (req.file) {
        try {
            banner = await uploadToCloudinary(req.file);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    } else {
        return next(new ErrorHandler('Banner image is required', 400));
    }

    const news = await News.create({
        title,
        description,
        banner,
        content,
    });

    return res.status(201).json({
        success: true,
        message: 'news has been created',
        data: news,
    });
});

// Update an existing news
export const AdminUpdateNews = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, content } = req.body;

    const news = await News.findById(id);
    if (!news) {
        return next(new ErrorHandler('news not found', 404));
    }

    // Update fields if provided
    if (title) news.title = title;
    if (description) news.description = description;
    if (content) news.content = content;

    // Handle banner update
    if (req.file) {
        try {
            // Delete old banner from Cloudinary if it exists
            if (news.banner?.public_id) {
                await deleteFromCloudinary(news.banner.public_id);
            }
            // Upload new banner
            news.banner = await uploadToCloudinary(req.file);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    await news.save();

    return res.status(200).json({
        success: true,
        message: 'news has been updated',
        data: news,
    });
});

// Get a single news
export const AdminGetNews = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
        return next(new ErrorHandler('news not found', 404));
    }

    return res.status(200).json({
        success: true,
        data: news,
    });
});

// Get all newss
export const AdminGetAllNews = TryCatch(async (req, res, next) => {
    const news = await News.find();

    return res.status(200).json({
        success: true,
        data: news,
    });
});

// Delete a news
export const AdminDeleteNews = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
        return next(new ErrorHandler('news not found', 404));
    }

    // Delete banner from Cloudinary if it exists
    if (news.banner?.public_id) {
        try {
            await deleteFromCloudinary(news.banner.public_id);
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    await news.deleteOne();

    return res.status(200).json({
        success: true,
        message: 'news has been deleted',
    });
});