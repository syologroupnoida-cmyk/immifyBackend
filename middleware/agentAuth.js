import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import { ErrorHandler } from "../error/error.js";

export const agentAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ErrorHandler("Unauthorized. Token missing.", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.agent_id) {
      return next(new ErrorHandler("Invalid session token", 401));
    }

    const agent = await Agent.findById(decoded.agent_id).select("-password");

    if (!agent) {
      return next(new ErrorHandler("Agent not found", 401));
    }

    // ✅ IMPORTANT: sessionToken OPTIONAL
    // Use this only if you are implementing force logout
    if (agent.sessionToken && agent.sessionToken !== token) {
      return next(new ErrorHandler("Session expired. Please login again.", 401));
    }

    req.agent = agent;
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token has expired. Please login again.", 401));
    }
    return next(new ErrorHandler("Unauthorized. Invalid token.", 401));
  }
};

export default agentAuth;
