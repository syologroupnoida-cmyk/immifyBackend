import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [3, "First name must be at least 3 characters long"],
        maxlength: [50, "First name must not exceed 50 characters"]
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
        trim: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v); // Simple validation for 10-digit phone numbers
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },




}, {
    timestamps: true
})



export const Contact = mongoose.model("Contact", contactSchema);