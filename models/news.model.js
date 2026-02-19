import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title name is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "description is required"],
        trim: true,
    },

    banner: {
        public_id: String,
        url: String
    },

    content: {
        type: String
    }


}, {
    timestamps: true
})


export const News = mongoose.model("News", blogSchema);