import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({

    serviceTitle : {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,

    },
     category: {
        type: String,
        required: true,

    },
    description: {
        type: String,
        required: true
    },
    location: {
    type : String,
    required: true
   },
   durationInDays: {
    type : Number  ,
    required: true
   },
 images: [
   {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
   } 
],

 status: {
   type: Boolean
 },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },
},{
    timestamps: true
})

 export const AgentService = mongoose.model('AgentService', serviceSchema )