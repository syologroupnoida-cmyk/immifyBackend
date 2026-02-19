import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { GetContact, NewContact } from '../controllers/contact.controller.js';

const router = express.Router();

router.route('/').post(NewContact)
router.route('/').get(GetContact)



export default router;