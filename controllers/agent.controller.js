import { ErrorHandler, TryCatch } from "../error/error.js";
import { Agent } from "../models/agent.model.js";
import jwt from "jsonwebtoken";
import { Lead } from "../models/lead.model.js";
import cloudinary from "cloudinary";
import { Payment } from "../models/lead.payment.model.js";
import bcrypt from 'bcrypt'


export const AgentSignup = TryCatch(async (req, res, next) => {
    console.log("Agent Signup Body:", req.body);
    
    const { firstName, lastName, email, phone, country, companyName, password } = req.body;

    // Check for missing fields
    if (!firstName || !lastName || !email || !phone || !country || !companyName || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Check if agent already exists
    let existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
        return next(new ErrorHandler("Agent already exists. Please login.", 400));
    }

    // Create a new agent
    console.log("Creating agent...");
    const newAgent = await Agent.create({
        firstName,
        lastName,
        email,
        phone,
        country,
        companyName,
        password
    });

    // Generate JWT token
    const token = jwt.sign({ agent_id: newAgent._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    newAgent.sessionToken = token;
    await newAgent.save({ validateBeforeSave: false });

    return res.status(201).json({
        success: true,
        message: "Signup successful",
        agent: newAgent,
        token
    });
});

export const AgentLogin = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }



    let agent = await Agent.findOne({ email }).select("+password");
    console.log('agent', agent)
    if (!agent) {
        return next(new ErrorHandler("agent is not exist please do SignUp", 400));
    }
    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
        return next(new ErrorHandler("invalid email and password", 400));
    }
    const token = jwt.sign({ agent_id: agent._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    agent.sessionToken = token; // Set session token
    await agent.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json({
            success: true,
            message: "Login successful",
            agent,
            token
        });
});

export const AgentLogout = TryCatch(async (req, res, next) => {
    // const agentId = req.params.agentId;
    const agentId = req.agent._id;
    if (!agentId) {
        return next(new ErrorHandler("Agent ID is required", 400));
    }
    let agent = await Agent.findById(agentId);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    agent.sessionToken = null; // Clear session token
    await agent.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json({
            success: true,
            message: "Logout successful",
        });
});

export const AgentProfile = TryCatch(async (req, res, next) => {
    // const agentId = req.params.agentId;
    const agentId = req.agent._id;
    if (!agentId) {
        return next(new ErrorHandler("Agent ID is required", 400));
    }
    let agent = await Agent.findById(agentId);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    return res
        .status(200)
        .json({
            success: true,
            agent
        });
});

export const AgentUpdateProfile = TryCatch(async (req, res, next) => {
    // const agentId = req.params.agentId;
    const { firstName, lastName, email, phone, country, companyName, agentProfile } = req.body;

    const agentId = req.agent._id;
    if (!agentId) {
        return next(new ErrorHandler("Agent ID is required", 400));
    }
    let agent = await Agent.findById(agentId);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    if (firstName) agent.firstName = firstName;
    if (lastName) agent.lastName = lastName;
    if (email) agent.email = email;
    if (phone) agent.phone = phone;
    if (country) agent.country = country;
    if (companyName) agent.companyName = companyName;
    if (agentProfile) {
        if (agent?.agentProfile?.public_id) {
            await cloudinary.v2.uploader.destroy(agent?.agentProfile?.public_id);
        }
        const profileUpload = await cloudinary.v2.uploader.upload(agentProfile, {
            folder: "agent/profile",
            format: "webp",
        });
        agent.agentProfile.public_id = profileUpload?.public_id;
        agent.agentProfile.url = profileUpload?.secure_url;
    }

    await agent.save({ validateBeforeSave: false })


    return res
        .status(200)
        .json({
            success: true,
            message: 'Agent details has been saved'
        });
});

export const AgentUpdateDocument = TryCatch(async (req, res, next) => {
    // const agentId = req.params.agentId;
    const { panCard, aadharCard, vetCertificate, companyCertificate, gstCertificate, } = req.body;

    const agentId = req.agent._id;
    if (!agentId) {
        return next(new ErrorHandler("Agent ID is required", 400));
    }
    let agent = await Agent.findById(agentId);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    if (panCard) {
        if (agent?.panCard?.public_id) {
            await cloudinary.v2.uploader.destroy(agent?.panCard?.public_id);
        }
        const profileUpload = await cloudinary.v2.uploader.upload(panCard, {
            folder: "agent/document/panCard",
            format: "webp",
        });
        agent.panCard.public_id = profileUpload?.public_id;
        agent.panCard.url = profileUpload?.secure_url;
    }

    if (aadharCard) {
        if (agent?.aadharCard?.public_id) {
            await cloudinary.v2.uploader.destroy(agent?.aadharCard?.public_id);
        }
        const profileUpload = await cloudinary.v2.uploader.upload(panCard, {
            folder: "agent/document/aadharCard",
            format: "webp",
        });
        agent.aadharCard.public_id = profileUpload?.public_id;
        agent.aadharCard.url = profileUpload?.secure_url;
    }

    if (vetCertificate) {
        if (agent?.vetCertificate?.public_id) {
            await cloudinary.v2.uploader.destroy(agent?.vetCertificate?.public_id);
        }
        const profileUpload = await cloudinary.v2.uploader.upload(vetCertificate, {
            folder: "agent/document/vetCertificate",
            format: "webp",
        });
        agent.vetCertificate.public_id = profileUpload?.public_id;
        agent.vetCertificate.url = profileUpload?.secure_url;
    }

    if (companyCertificate) {
        if (agent?.companyCertificate?.public_id) {
            await cloudinary.v2.uploader.destroy(agent?.companyCertificate?.public_id);
        }
        const profileUpload = await cloudinary.v2.uploader.upload(companyCertificate, {
            folder: "agent/document/companyCertificate",
            format: "webp",
        });
        agent.companyCertificate.public_id = profileUpload?.public_id;
        agent.companyCertificate.url = profileUpload?.secure_url;
    }

    if (gstCertificate) {
        if (agent?.gstCertificate?.public_id) {
            await cloudinary.v2.uploader.destroy(agent?.gstCertificate?.public_id);
        }
        const profileUpload = await cloudinary.v2.uploader.upload(gstCertificate, {
            folder: "agent/document/gstCertificate",
            format: "webp",
        });
        agent.gstCertificate.public_id = profileUpload?.public_id;
        agent.gstCertificate.url = profileUpload?.secure_url;
    }

    await agent.save({ validateBeforeSave: false })


    return res
        .status(200)
        .json({
            success: true,
            message: 'Agent details has been saved'
        });
});

export const AgentDashboardCount = TryCatch(async (req, res, next) => {


    const agentId = req.agent._id;
    if (!agentId) {
        return next(new ErrorHandler("Agent ID is required", 400));
    }
    let agent = await Agent.findById(agentId);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    // lead count of verified lead, new lead
    const totalLeads = await Payment.find({ agentId: agent._id, paymentFor: 'Buy Lead' }).countDocuments()

    // earing count total wallet amount, earing amount 
    // const totalWallet = totalAgents.reduce((acc, item) => {
    //     return acc + (item.wallet || 0);
    // }, 0);

    // const payment = await Payment.find()
    // const totalEarning = payment.reduce((acc, item) => {
    //     return acc + (item.price || 0);
    // }, 0);


    return res
        .status(200)
        .json({
            success: true,
            agentDashboardCount: {
                totalLeads
            }

        });
});

export const AgentGetLastWeekLeadCount = TryCatch(async (req, res, next) => {
    const now = new Date();

    // Get last week's Monday
    const lastWeekStart = new Date(now);
    const dayOfWeek = lastWeekStart.getDay(); // 0 (Sun) to 6 (Sat)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    lastWeekStart.setDate(now.getDate() - daysToSubtract - 7); // last week's Monday
    lastWeekStart.setHours(0, 0, 0, 0);

    // Last week's Sunday
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    lastWeekEnd.setHours(23, 59, 59, 999);

    const data = await Payment.find({ agentId: req.agent._id }).aggregate([
        {
            $match: {
                createdAt: {
                    $gte: lastWeekStart,
                    $lte: lastWeekEnd
                },
                paymentFor: "Buy Lead", // 👈 Filter only 'Buy Lead' payments
            }
        },
        {
            $project: {
                dayOfWeek: { $dayOfWeek: "$createdAt" } // 1 (Sun) to 7 (Sat)
            }
        },
        {
            $group: {
                _id: "$dayOfWeek",
                leadCount: { $sum: 1 }
            }
        }
    ]);

    // Convert MongoDB's 1 (Sun)–7 (Sat) to JS Mon–Sun index
    const counts = new Array(7).fill(0); // Mon to Sun
    data.forEach(item => {
        let dayIndex = (item._id + 5) % 7; // Map 1–7 to 0–6 (Mon to Sun)
        counts[dayIndex] = item.leadCount;
    });

    res.status(200).json({
        success: true,
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: counts
    });
});

export const AgentGetCurrentWeekLeadCount = TryCatch(async (req, res, next) => {
    const now = new Date();

    // Get this week's Monday
    const currentWeekStart = new Date(now);
    const dayOfWeek = currentWeekStart.getDay(); // 0 = Sun, 1 = Mon
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentWeekStart.setDate(currentWeekStart.getDate() - daysToSubtract);
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    const data = await Payment.find({ agentId: req.agent._id }).aggregate([
        {
            $match: {
                createdAt: {
                    $gte: currentWeekStart,
                    $lte: currentWeekEnd,
                },
                paymentFor: "Buy Lead", // 👈 Filter only 'Buy Lead' payments
            },
        },
        {
            $project: {
                dayOfWeek: { $dayOfWeek: "$createdAt" }, // 1 = Sun, 2 = Mon, etc.
            },
        },
        {
            $group: {
                _id: "$dayOfWeek",
                leadCount: { $sum: 1 },
            },
        },
    ]);

    const counts = new Array(7).fill(0);
    data.forEach((item) => {
        let dayIndex = (item._id + 5) % 7;
        counts[dayIndex] = item.leadCount;
    });

    res.status(200).json({
        success: true,
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: counts,
    });
});
// ------------------------lead api-------------------------

export const AgentBuyLead = TryCatch(async (req, res, next) => {
    // const { firstName, lastName, email, phone, country, companyName } = req.body;

    const leadId = req.params.leadId;
    const agentId = req.agent._id;


    let agent = await Agent.findById(agentId);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    let lead = await Lead.findById(leadId);
    if (!lead) {
        return next(new ErrorHandler("lead not found", 404));
    }

    lead.agentId = agent._id
    lead.sold = true

    await lead.save({ validateBeforeSave: false })


    return res
        .status(200)
        .json({
            success: true,
            message: 'Lead purchased successfully'
        });
});

export const AgentGetPurchasedLead = TryCatch(async (req, res, next) => {

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 3
    const search = req.query.search || ''
    const skip = (page - 1) * limit
    const agentId = req.agent._id;

    let agent = await Agent.findById(agentId);
    if (!agent) {
        return next(new ErrorHandler("auth error", 404));
    }

    const query = { agentId: agent._id, sold: true }
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
        ]
    }

    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Get total count for pagination
    const totalLeads = await Lead.countDocuments(query);

    // let leads = await Lead.find({ agentId: agent._id, sold: true });
    if (!leads || leads.length === 0) {
        return next(new ErrorHandler("lead not found", 404));
    }


    return res
        .status(200)
        .json({
            success: true,
            leads,
            pagination: {
                totalLeads,
                totalPages: Math.ceil(totalLeads / limit),
                currentPage: page,
                itemsPerPage: limit,
            },
        });
});

