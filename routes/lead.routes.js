import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { AdminCreateLead, AdminDeleteLead, AdminGetAllLead, AdminGetAllSoldLead, AdminGetSingleLead, AdminUpdateLeadPrice, AdminVerifyLead, GetAllLeadCountry, GetAllLeadToSale, UsercreateLead } from '../controllers/lead.controller.js';

const router = express.Router();

// lead api
router.route('/').post(AdminCreateLead)
router.route('/').get(AdminGetAllLead)
router.route('/new').get(GetAllLeadToSale)
router.route('/countrys').get(GetAllLeadCountry)
router.route('/:leadId').get(AdminGetSingleLead)
router.route('/test/sold').get(AdminGetAllSoldLead)

router.route('/:leadId').put(adminAuth, AdminUpdateLeadPrice)
router.route('/:leadId').delete(adminAuth, AdminDeleteLead)
router.route('/verify/:leadId').patch(adminAuth, AdminVerifyLead)

router.route('/userLead').post(UsercreateLead)


export default router;