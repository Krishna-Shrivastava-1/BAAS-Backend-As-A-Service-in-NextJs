import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
    ref:'project'
    },
    serviceName:{
type:String
    },
    subServiceName:{
type:String
    },
    serviceSchema: {
        type: Object,
    },
    totalApiCalls: {
        type: Number,
        default: 0
    },
    subscriptionType:{
        type:String,
        default:'Free'
    },
    apiEndPoint:{
        type:String,
        trim:true
    }
}, { timestamps: true })

export const serviceModel = mongoose.models.service || mongoose.model('service', serviceSchema)