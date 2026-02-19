import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { AdminDashboardCount, AdminDeleteAgent, AdminGetAllAgent, AdminLogin, AdminLogout, AdminProfile, AdminSignup, AdminVerifyAgent, AdminViewAgentDetails, getCurrentWeekLeadCount, getLastWeekLeadCount, getPaymentStats } from '../controllers/admin.controller.js';

const router = express.Router();

router.route('/signup').post(AdminSignup)
router.route('/login').post(AdminLogin)
router.route('/logout').get(adminAuth, AdminLogout)
router.route('/profile').get(adminAuth, AdminProfile)

router.route('/dashboard-count').get(adminAuth,AdminDashboardCount)
router.route('/payment-stats').get(adminAuth,getPaymentStats)
router.route('/payment-stats/week-days').get(adminAuth,getLastWeekLeadCount)
router.route('/payment-stats/current-week-days').get(adminAuth,getCurrentWeekLeadCount)

// --------------------agent api ---------------------
router.route('/agent').get(adminAuth,AdminGetAllAgent)
router.route('/agent/:agentId').get(adminAuth,AdminViewAgentDetails)
router.route('/agent/:agentId').delete(adminAuth,AdminDeleteAgent)
router.route('/agent/verify/:agentId').put(adminAuth,AdminVerifyAgent)




export default router;