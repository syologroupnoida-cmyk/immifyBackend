import express from 'express';
import { AddMoneyInWallet, AdminGetAllTransaction, AgentAllTransaction, AgentAllWalletTransaction, AgentSingleTransaction, BuyNewLeads } from '../controllers/lead.payment.controller.js';
import agentAuth from '../middleware/agentAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.route('/add').post(agentAuth, AddMoneyInWallet)
router.route('/lead/:leadId').get(agentAuth, BuyNewLeads)
router.route('/agent').get(agentAuth, AgentAllTransaction)
router.route('/agent/wallet').get(agentAuth, AgentAllWalletTransaction)
router.route('/agent/:leadId').get(AgentSingleTransaction)
router.route('/admin').get(adminAuth,AdminGetAllTransaction)

export default router;