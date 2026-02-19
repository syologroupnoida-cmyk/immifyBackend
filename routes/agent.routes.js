import express from "express";
import {
  AgentSignup,
  AgentLogin,
  AgentLogout,
  AgentProfile,
  AgentUpdateProfile,
  AgentUpdateDocument,
  AgentDashboardCount,
  AgentGetLastWeekLeadCount,
  AgentGetCurrentWeekLeadCount,
  AgentBuyLead,
  AgentGetPurchasedLead,
} from "../controllers/agent.controller.js";

import agentAuth from "../middleware/agentAuth.js";

const router = express.Router();

/* ================= PUBLIC ROUTES ================= */
// 🔓 Signup & Login → NO TOKEN
router.post("/signup", AgentSignup);
router.post("/login", AgentLogin);

/* ================= PROTECTED ROUTES ================= */
// 🔒 Token required
router.post("/logout", agentAuth, AgentLogout);

router.get("/profile", agentAuth, AgentProfile);
router.put("/profile", agentAuth, AgentUpdateProfile);
router.put("/document", agentAuth, AgentUpdateDocument);

router.get("/dashboard-count", agentAuth, AgentDashboardCount);

router.get(
  "/payment-stats/last-week",
  agentAuth,
  AgentGetLastWeekLeadCount
);

router.get(
  "/payment-stats/current-week",
  agentAuth,
  AgentGetCurrentWeekLeadCount
);

/* ================= LEAD ROUTES ================= */
// Buy lead (should be POST, not GET)
router.post("/buy/:leadId", agentAuth, AgentBuyLead);

// Get purchased leads
router.get("/lead", agentAuth, AgentGetPurchasedLead);

export default router;
