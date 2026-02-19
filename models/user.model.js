import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
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
        select: false,
        minlength: [6, "Password must be at least 6 characters long"],
    },
     googleId: {
        type: String,
        unique: true,
        sparse: true, 
    }
    // country: {
    //     type: String,
    //     required: [true, "Country is required"],
    //     trim: true,
    // },
    // state: {
    //     type: String,
    //     trim: true,
    // },
    // destination: {
    //     type: String,
    //     required: [true, "Destination is required"],
    //     trim: true,
    // },
    // leadType: {
    //     type: String,
    // },

    // sold: {
    //     type: Boolean,
    //     default: false,
    // },

    // // admin will update this field
    // active: {
    //     type: Boolean,
    //     default: false,
    // },
    // price: {
    //     type: Number,
    //     default: 0,
    // },


    // resetPasswordToken: String,
    // resetPasswordExpire: Date,

    // sessionToken: {
    //     type: String,
    //     default: null,
    // },
    // agentId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Agent",
    //     default: null,
    // }
}, {
    timestamps: true
})

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export const User = mongoose.model("User", userSchema);