import express from 'express';
import { GoogleSignUp, UserLogin, UserSignup } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/login').post(UserLogin)
router.route('/signup').post(UserSignup)
router.route('/google').post(GoogleSignUp);

router.route('/verify').get(authMiddleware);
export default router;