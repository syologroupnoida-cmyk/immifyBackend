import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

    razorpay_payment_id: {
        type: String,
    },
    razorpay_order_id: {
        type: String,
    },
    razorpay_signature: {
        type: String,
    },
    price: {
        type: Number,
        default: 0,
    },
    leadTransactionId: {
        type: String,
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
        default: null,
    },

    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
        default: null,
    },
    paymentFor: {
        type: String,
        default: 'Add Wallet'
    },
}, {
    timestamps: true
})


export const Payment = mongoose.model("Payment", paymentSchema);