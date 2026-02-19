import { ErrorHandler, TryCatch } from "../error/error.js";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import { Lead } from "../models/lead.model.js";
import { Payment } from "../models/lead.payment.model.js";
import bcrypt from 'bcrypt'

export const AdminSignup = TryCatch(async (req, res, next) => {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check for missing fields
    if (!firstName || !lastName || !email || !phone || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Check if Admin already exists
    let existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        return next(new ErrorHandler("Admin already exists. Please login.", 400));
    }

    // Create a new Admin
    const newAdmin = await Admin.create({
        firstName,
        lastName,
        email,
        phone,
        password
    });

    // Generate JWT token
    const token = jwt.sign({ admin_id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: "5min" });

    newAdmin.sessionToken = token;
    await newAdmin.save({ validateBeforeSave: false });

    // res.cookie('refreshToken', token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'none',
    //     maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.status(201).json({
        success: true,
        message: "Signup successful",
        Admin: newAdmin,
        token
    });


});

export const AdminLogin = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    let admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
        return next(
            new ErrorHandler("admin is not exist please do SignUp", 400)
        );
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
       return next(new ErrorHandler("Invalid credentials", 401))
    }

    const token = jwt.sign({ admin_id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    admin.sessionToken = token; // Set session token
    await admin.save({ validateBeforeSave: false });



    return res
        .status(200)
        .json({
            success: true,
            message: "Login successful",
            token, admin
        });
});

export const AdminLogout = TryCatch(async (req, res, next) => {
    // const AdminId = req.params.AdminId;
    const adminId = req.admin._id;
    if (!adminId) {
        return next(new ErrorHandler("Admin ID is required", 400));
    }
    let admin = await Admin.findById(adminId);
    if (!admin) {
        return next(new ErrorHandler("admin not found", 404));
    }
    // res.clearCookie('refreshToken');
    admin.sessionToken = null; // Clear session token
    await admin.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json({
            success: true,
            message: "Logout successful",
        });
});

export const refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const token = jwt.sign({ admin_id: decoded.admin_id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ token });
    } catch {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

export const AdminProfile = TryCatch(async (req, res, next) => {
    // const AdminId = req.params.AdminId;
    const adminId = req.admin._id;
    if (!adminId) {
        return next(new ErrorHandler("admin ID is required", 400));
    }
    let admin = await Admin.findById(adminId);
    if (!admin) {
        return next(new ErrorHandler("admin not found", 404));
    }

    return res
        .status(200)
        .json({
            success: true,
            admin
        });
});

export const AdminDashboardCount = TryCatch(async (req, res, next) => {
    // const AdminId = req.params.AdminId;
    // const adminId = req.admin._id;
    // if (!adminId) {
    //     return next(new ErrorHandler("admin ID is required", 400));
    // }
    // let admin = await Admin.findById(adminId);
    // if (!admin) {
    //     return next(new ErrorHandler("admin not found", 404));
    // }

    // get agent count of verified agent, pending agent,reject agent
    const totalAgents = await Agent.find()
    const verifiedAgents = await Agent.find({ status: 'done' }).countDocuments()
    const pendingAgents = await Agent.find({ status: 'pending' }).countDocuments()
    const rejectAgents = await Agent.find({ status: 'reject' }).countDocuments()

    // lead count of verified lead, new lead
    const totalLeads = await Lead.find().countDocuments()
    const verifiedLeads = await Lead.find({ active: true }).countDocuments()
    const newLeads = await Lead.find({ active: false }).countDocuments()

    // earing count total wallet amount, earing amount 
    const totalWallet = totalAgents.reduce((acc, item) => {
        return acc + (item.wallet || 0);
    }, 0);

    const payment = await Payment.find()
    const totalEarning = payment.reduce((acc, item) => {
        return acc + (item.price || 0);
    }, 0);


    return res
        .status(200)
        .json({
            success: true,
            adminDashboardCount: {
                totalAgents: totalAgents.length,
                verifiedAgents,
                pendingAgents,
                rejectAgents,

                totalLeads,
                verifiedLeads,
                verifiedLeads,
                newLeads,

                totalWallet,
                totalEarning
            }

        });
});

// Helper function to format date labels
const getWeekLabel = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return `${startOfWeek.toLocaleDateString("en-IN")}`;
};

export const getPaymentStats = TryCatch(async (req, res, next) => {
    const now = new Date();

    // --- Month-wise (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthData = await Payment.aggregate([
        {
            $match: {
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                totalAmount: { $sum: "$price" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        }
    ]);

    // --- Week-wise (last 6 weeks)
    const sixWeeksAgo = new Date(now);
    sixWeeksAgo.setDate(now.getDate() - 42); // 6 weeks = 42 days

    const weekData = await Payment.aggregate([
        {
            $match: {
                createdAt: { $gte: sixWeeksAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $isoWeekYear: "$createdAt" },
                    week: { $isoWeek: "$createdAt" }
                },
                totalAmount: { $sum: "$price" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.week": 1 }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            monthWise: monthData.map((item) => ({
                label: `${item._id.month}/${item._id.year}`,
                totalAmount: item.totalAmount
            })),
            weekWise: weekData.map((item) => ({
                label: `Week ${item._id.week} (${item._id.year})`,
                totalAmount: item.totalAmount
            }))
        }
    });
});

export const getLastWeekLeadCount = TryCatch(async (req, res, next) => {
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

    const data = await Payment.aggregate([
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

export const getCurrentWeekLeadCount = TryCatch(async (req, res, next) => {
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

    const data = await Payment.aggregate([
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




// ------------------------agetn api-------------------------

export const AdminVerifyAgent = TryCatch(async (req, res, next) => {

    const { status } = req.body
    let agent = await Agent.findById(req.params.agentId);
    if (!agent || agent.length === 0) {
        return next(new ErrorHandler("agent not found", 400));
    }

    // agent.active = true; // Set agent as active
    agent.status = status;
    await agent.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json({
            success: true,
            message: "Agent verified successfully",
        });
});

export const AdminDeleteAgent = TryCatch(async (req, res, next) => {

    let agent = await Agent.findById(req.params.agentId);
    if (!agent || agent.length === 0) {
        return next(new ErrorHandler("agent not found", 400));
    }

    await agent.deleteOne(); // Delete the agent

    return res
        .status(200)
        .json({
            success: true,
            message: "Agent deleted successfully",
        });
});

export const AdminViewAgentDetails = TryCatch(async (req, res, next) => {

    let agent = await Agent.findById(req.params.agentId).select("-password -sessionToken");
    if (!agent || agent.length === 0) {
        return next(new ErrorHandler("agent not found", 400));
    }


    return res
        .status(200)
        .json({
            success: true,
            agent
        });
});

export const AdminGetAllAgent = TryCatch(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
        ];
    }

    let agents = await Agent.find(query).select("-password -sessionToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalAgents = await Agent.countDocuments(query);


    if (!agents || agents.length === 0) {
        return next(new ErrorHandler("agent not found", 400));
    }


    return res
        .status(200)
        .json({
            success: true,
            agents,
            pagination: {
                totalAgents,
                totalPages: Math.ceil(totalAgents / limit),
                currentPage: page,
                itemsPerPage: limit,
            },
        });
});



