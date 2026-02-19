import { ErrorHandler, TryCatch } from "../error/error.js";
import { Lead } from "../models/lead.model.js";

export const UsercreateLead = async (req, res) => {
    try {
        console.log(req.body)
        const lead = await Lead.create(req.body);

        res.status(201).json({
            success: true,
            message: "Lead submitted successfully",
            data: lead
        });

        console.log(lead)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// --------------------lead admin api ---------------------
export const AdminCreateLead = TryCatch(async (req, res, next) => {
    const { firstName, lastName, email, phone, country, state, destination } = req.body;

    if (!firstName || !lastName || !email || !phone || !country || !destination) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    await Lead.create({
        firstName,
        lastName,
        email,
        phone,
        country,
        state,
        destination
    });

    return res
        .status(201)
        .json({
            success: true,
            message: "Our team will contact you shortly",
        });
});

// export const AdminGetAllLead = TryCatch(async (req, res, next) => {

//     const leads = await Lead.find({
//         sold: false,
//     }).select("-password -sessionToken").sort({ createdAt: -1 });

//     if (!leads || leads.length === 0) {
//         return next(new ErrorHandler("No leads found", 404));
//     }

//     return res
//         .status(200)
//         .json({
//             success: true,
//             leads
//         });
// });



// get all leads with pagination


export const AdminGetAllLead = TryCatch(async (req, res, next) => {
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
        ];
    }

    // Fetch paginated leads
    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Get total count for pagination
    const totalLeads = await Lead.countDocuments(query);

    if (!leads || leads.length === 0) {
        return next(new ErrorHandler("No leads found", 404));
    }

    return res.status(200).json({
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

// export const GetAllLeadToSale = TryCatch(async (req, res, next) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 3;
//     const search = req.query.search || "";
//     const skip = (page - 1) * limit;

//     // Build query
//     const query = { sold: false };
//     if (search) {
//         query.$or = [
//             { firstName: { $regex: search, $options: "i" } },
//             { lastName: { $regex: search, $options: "i" } },
//         ];
//     }

//     // Fetch paginated leads
//     const leads = await Lead.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit);

//     // Get total count for pagination
//     const totalLeads = await Lead.countDocuments(query);

//     if (!leads || leads.length === 0) {
//         return next(new ErrorHandler("No leads found", 404));
//     }

//     return res.status(200).json({
//         success: true,
//         leads,
//         pagination: {
//             totalLeads,
//             totalPages: Math.ceil(totalLeads / limit),
//             currentPage: page,
//             itemsPerPage: limit,
//         },
//     });
// });

export const GetAllLeadToSale = TryCatch(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9; // Align with frontend itemsPerPage
    const search = req.query.search || "";
    const country = req.query.country || "";
    const destination = req.query.destination || "";
    const skip = (page - 1) * limit;

    console.log(country)

    // Build query
    const query = { sold: false, active: true };
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
        ];
    }
    if (country) {
        query.country = country;
    }
    if (destination) {
        query.destination = destination;
    }

    // Fetch paginated leads
    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Get total count for pagination
    const totalLeads = await Lead.countDocuments(query);

    if (!leads || leads.length === 0) {
        return next(new ErrorHandler("No leads found", 404));
    }

    return res.status(200).json({
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

export const GetAllLeadCountry = TryCatch(async (req, res, next) => {
    const countries = await Lead.distinct("country", { active: true });
    const destinations = await Lead.distinct("destination", { active: true });

    if (!countries.length && !destinations.length) {
        return next(new ErrorHandler("No leads found", 404));
    }

    res.status(200).json({
        success: true,
        countries,
        destinations,
    });
});


export const AdminGetSingleLead = TryCatch(async (req, res, next) => {

    const { leadId } = req.params
    const lead = await Lead.findById(leadId)

    if (!lead || lead.length === 0) {
        return next(new ErrorHandler("No leads found", 404));
    }

    return res
        .status(200)
        .json({
            success: true,
            lead
        });
});

export const AdminGetAllSoldLead = TryCatch(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build query
    const query = { sold: true };
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
        ];
    }

    // Fetch paginated leads
    const leads = await Lead.find(query)
        .populate('agentId', 'firstName lastName email phone country companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Get total count for pagination
    const totalLeads = await Lead.countDocuments(query);



    if (!leads || leads.length === 0) {
        return next(new ErrorHandler("No leads found", 404));
    }

    return res.status(200).json({
        success: true,
        soldLeads: leads,
        pagination: {
            totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: page,
            itemsPerPage: limit,
        },
    });
});

export const AdminUpdateLeadPrice = TryCatch(async (req, res, next) => {

    const { leadId } = req.params;
    const { price } = req.body;
    if (!price && price !== 0) {
        return next(new ErrorHandler("Price is required", 400));
    }
    const lead = await Lead.findById(leadId);

    if (!lead || lead.length === 0) {
        return next(new ErrorHandler("No leads found", 404));
    }
    if (price < 0) {
        return next(new ErrorHandler("Price cannot be negative", 400));
    }
    lead.price = price;
    lead.active = true;


    await lead.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json({
            success: true,
            message: "Lead price update successfully",
        });
});

export const AdminDeleteLead = TryCatch(async (req, res, next) => {

    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);

    if (!lead || lead.length === 0) {
        return next(new ErrorHandler("No leads found", 404));
    }

    await lead.deleteOne();

    return res
        .status(200)
        .json({
            success: true,
            message: "Lead deleted successfully",
        });
});

export const AdminVerifyLead = TryCatch(async (req, res, next) => {

    const { leadId } = req.params;

    let lead = await Lead.findById(leadId);

    if (!lead || lead.length === 0) {
        return next(new ErrorHandler("No leads found", 404));
    }

    lead.active = true;

    await lead.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json({
            success: true,
            message: "Lead verified successfully",
        });
});