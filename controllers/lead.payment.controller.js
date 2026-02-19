import { ErrorHandler, TryCatch } from "../error/error.js";
import { Agent } from "../models/agent.model.js";
import { Lead } from "../models/lead.model.js";
import { Payment } from "../models/lead.payment.model.js";

import { v4 as uuidv4 } from "uuid";

export const AddMoneyInWallet = TryCatch(async (req, res, next) => {
    const { price } = req.body;

    // Validate input
    if (!price || isNaN(price) || price <= 0) {
        return next(new ErrorHandler("Invalid amount", 400));
    }

    // Find agent
    const agent = await Agent.findById(req.agent._id);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    // Update wallet
    agent.wallet += Number(price);

    // Create payment record
    let test = await Payment.create({
        price,
        agentId: agent._id,
        // Optional lead-related fields can go here if needed
    });
    console.log(test)
    // Save agent
    await agent.save({ validateBeforeSave: false });

    // Response
    return res.status(200).json({
        success: true,
        message: `₹${price} added to wallet successfully.`, test
    });
});


// export const BuyNewLeads = TryCatch(async (req, res, next) => {
//     // const { price } = req.body;
//     const { leadId } = req.params;

//     // Fetch agent
//     const agent = await Agent.findById(req.agent._id);
//     if (!agent) {
//         return next(new ErrorHandler("Agent not found", 404));
//     }

//     if (agent.status == 'pending') {
//         return next(new ErrorHandler("your profile under review", 404));
//     }
//     if (agent.status == 'reject') {
//         return next(new ErrorHandler("not verified please connect to admin ", 404));
//     }

//     // Fetch lead
//     const lead = await Lead.findById(leadId);
//     if (!lead) {
//         return next(new ErrorHandler("Lead not found", 404));
//     }

//     // Check wallet balance
//     if (agent.wallet < lead.price) {
//         return next(
//             new ErrorHandler("Insufficient wallet balance. Please add more funds.", 400)
//         );
//     }



//     // Check if lead is already purchased
//     if (lead.agentId) {
//         return next(new ErrorHandler("Lead has already been purchased", 400));
//     }

//     // Generate a unique transaction ID
//     // const leadTransactionId = crypto.randomBytes(12).toString("hex");
//     const leadTransactionId = uuidv4();

//     // Deduct amount and assign lead
//     agent.wallet -= lead.price;
//     lead.agentId = agent._id;
//     lead.sold = true


//     // Save updated agent and lead
//     await agent.save({ validateBeforeSave: false });
//     await lead.save({ validateBeforeSave: false });

//     // Create payment record
//     const payment = await Payment.create({
//         leadTransactionId,
//         price: lead.price,
//         leadId: lead._id,
//         leadName: lead.firstName,
//         leadDestination: lead.destination,
//         leadDas: lead.country,
//         agentId: agent._id,
//         paymentFor: 'Buy Lead',
//     });

//     // Send success response
//     return res.status(200).json({
//         success: true,
//         message: "Lead purchased successfully. Transaction recorded.",
//         payment,
//     });
// });

export const BuyNewLeads = TryCatch(async (req, res, next) => {
    const { leadId } = req.params;

    // 1. Validate agent
    const agent = await Agent.findById(req.agent._id);
    if (!agent) return next(new ErrorHandler("Agent not found", 404));

    if (agent.status === 'pending') {
        return next(new ErrorHandler("Your profile is under review.", 403));
    }

    if (agent.status === 'reject') {
        return next(new ErrorHandler("Not verified. Please contact admin.", 403));
    }

    // 2. Fetch lead
    const lead = await Lead.findById(leadId);
    if (!lead) return next(new ErrorHandler("Lead not found", 404));

    // 3. Check if lead already sold
    if (lead.agentId) {
        return next(new ErrorHandler("Lead has already been purchased.", 400));
    }

    // 4. Wallet balance check
    if (agent.wallet < lead.price) {
        return next(new ErrorHandler("Insufficient wallet balance. Please add more funds.", 400));
    }

    // 5. Process transaction
    const leadTransactionId = uuidv4();

    agent.wallet -= lead.price;
    lead.agentId = agent._id;
    lead.sold = true;

    await agent.save({ validateBeforeSave: false });
    await lead.save({ validateBeforeSave: false });

    // 6. Record payment
    const payment = await Payment.create({
        leadTransactionId,
        price: lead.price,
        leadId: lead._id,
        leadName: lead.firstName,
        leadDestination: lead.destination,
        leadDas: lead.country,
        agentId: agent._id,
        paymentFor: "Buy Lead",
    });

    // 7. Response
    return res.status(200).json({
        success: true,
        message: "Lead purchased successfully. Transaction recorded.",
        payment,
    });
});

export const BuyMultipleLeads = TryCatch(async (req, res, next) => {
    const { leadIds } = req.body; // Array of lead IDs
    const agent = await Agent.findById(req.agent._id);
    if (!agent) return next(new ErrorHandler("Agent not found", 404));
    if (agent.status === 'pending') return next(new ErrorHandler("Profile under review", 403));
    if (agent.status === 'reject') return next(new ErrorHandler("Not verified. Contact admin.", 403));

    const leads = await Lead.find({ _id: { $in: leadIds } });

    let totalCost = 0;
    const validLeads = [];

    leads.forEach(lead => {
        if (!lead.agentId) {
            validLeads.push(lead);
            totalCost += lead.price;
        }
    });

    if (agent.wallet < totalCost) {
        return next(new ErrorHandler("Insufficient wallet balance.", 400));
    }

    const payments = [];

    for (let lead of validLeads) {
        const transactionId = uuidv4();
        agent.wallet -= lead.price;
        lead.agentId = agent._id;
        lead.sold = true;

        await lead.save({ validateBeforeSave: false });

        const payment = await Payment.create({
            leadTransactionId: transactionId,
            price: lead.price,
            leadId: lead._id,
            leadName: lead.firstName,
            leadDestination: lead.destination,
            leadDas: lead.country,
            agentId: agent._id,
            paymentFor: 'Buy Lead',
        });

        payments.push(payment);
    }

    await agent.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true,
        message: `${payments.length} lead(s) purchased successfully.`,
        payments,
    });
});


export const AgentAllWalletTransaction = TryCatch(async (req, res, next) => {
    const agent = await Agent.findById(req.agent._id);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    // Get total count for pagination

    const payments = await Payment.find({ agentId: agent._id, paymentFor: 'Add Wallet' })
        .sort({ createdAt: -1 })


    if (!payments || payments.length === 0) {
        return next(new ErrorHandler("No leads found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Transactions fetched successfully",
        payments,

    });
});


export const AgentAllTransaction = TryCatch(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const agent = await Agent.findById(req.agent._id);
    if (!agent) {
        return next(new ErrorHandler("Agent not found", 404));
    }

    const pipeline = [
        { $match: { agentId: agent._id } },

        {
            $lookup: {
                from: "leads", // Collection name
                localField: "leadId",
                foreignField: "_id",
                as: "lead"
            }
        },
        { $unwind: "$lead" },
    ];

    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { "lead.firstName": { $regex: search, $options: "i" } },
                    { "lead.lastName": { $regex: search, $options: "i" } },
                    { "lead.country": { $regex: search, $options: "i" } },
                    { "lead.destination": { $regex: search, $options: "i" } },
                ]
            }
        });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
        $facet: {
            payments: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: "count" }]
        }
    });

    const result = await Payment.aggregate(pipeline);
    const payments = result[0].payments;
    const totalLeads = result[0].total[0]?.count || 0;

    return res.status(200).json({
        success: true,
        message: "Filtered transactions fetched",
        payments,
        pagination: {
            totalItems: totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: page,
            itemsPerPage: limit
        }
    });
});


export const AgentSingleTransaction = TryCatch(async (req, res, next) => {

    const { leadId } = req.params

    const payments = await Payment.findById(leadId)
        .populate('leadId', 'firstName lastName email phone country destination')

    return res.status(200).json({
        success: true,
        payments,
    });
});

export const AdminGetAllTransaction = TryCatch(async (req, res, next) => {

    const payments = await Payment.find()
        .populate('agentId', 'firstName lastName phone')
        .populate('leadId', 'firstName lastName phone country destination')
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "All transactions fetched successfully",
        payments,
    });
});



