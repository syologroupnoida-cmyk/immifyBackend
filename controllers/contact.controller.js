import { ErrorHandler, TryCatch } from "../error/error.js";
import { Contact } from "../models/contact.model.js";



export const NewContact = TryCatch(async (req, res, next) => {
    const { firstName, email, subject, message } = req.body;

    if (!firstName || !email || !subject || !message) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    await Contact.create({
        firstName,
        email,
        subject,
        message
    });

    return res
        .status(201)
        .json({
            success: true,
            message: "Our team will contact you shortly",
        });
});

export const GetContact = TryCatch(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    const skip = (page - 1) * limit;

    const [contact, totalContact] = await Promise.all([
        Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Contact.countDocuments(),
    ]);

    return res.status(200).json({
        success: true,
        contact,
        pagination: {
            totalContact,
            totalPages: Math.ceil(totalContact / limit),
            currentPage: page,
            itemsPerPage: limit,
        },
    });
});
