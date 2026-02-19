import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
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
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
    },
    state: {
        type: String,
        trim: true,
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
        trim: true,
    },
    type: {
        type: String,
        enum: ["immigration", "work", "study", "visit", "business"],
        required: true
    },

    sold: {
        type: Boolean,
        default: false,
    },

    // admin will update this field
    active: {
        type: Boolean,
        default: false,
    },
    price: {
        type: Number,
        default: 0,
    },

    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
        default: null,
    }
}, {
    timestamps: true
})


export const Lead = mongoose.model("Lead", leadSchema);