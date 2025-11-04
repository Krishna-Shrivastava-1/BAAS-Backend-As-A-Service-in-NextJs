import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    mongoDbUri: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    typeOfService: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'service'
    }],
    totalApiCalls: {
        type: Number,
        default: 0
    },
    apiKey:{
        type:String,
        trim:true
    },
    subscriptionType:{
        type:String,
        default:'Free'
    },
    allowedOrigins: {
    type: [String],
    default: [], // e.g., ["https://tenant.com", "http://localhost:5173"]
  }
}, { timestamps: true })

export const projectModel = mongoose.models.project || mongoose.model('project', projectSchema)