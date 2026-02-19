import mongoose from "mongoose";
import bcrypt from "bcrypt";

const agentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [3, "First name must be at least 3 characters long"],
        maxlength: [50, "First name must not exceed 50 characters"]
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minlength: [3, "Last name must be at least 3 characters long"],
        maxlength: [50, "Last name must not exceed 50 characters"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v); // Simple email validation
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v); // Simple validation for 10-digit phone numbers
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [4, "Password must be at least 4 characters long"],
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
    },

    companyName: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
    },
    gstNumber: {
        type: String,
        trim: true,
    },
    agentProfile: {
        public_id: String,
        url: String,
    },
    panCard: {
        public_id: String,
        url: String,
    },
    aadharCard: {
        public_id: String,
        url: String,
    },
    vetCertificate: {
        public_id: String,
        url: String,
    },
    companyCertificate: {
        public_id: String,
        url: String,
    },
    gstCertificate: {
        public_id: String,
        url: String,
    },


    verified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["pending", "reject", "done"],
        default: "pending",
    },
    wallet: {
        type: Number,
        default: 0
    },


    resetPasswordToken: String,
    resetPasswordExpire: Date,

    sessionToken: {
        type: String,
        default: null,
    },
}, {
    timestamps: true
})

// Middleware to hash password before saving
agentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export const Agent = mongoose.model("Agent", agentSchema);