import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        select: false
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects'
    }],
    totalBill: {
        type: String,
        default: '0'
    },
    subscriptionType: {
        type: String,
        default: 'Free'
    },
    role: {
        type: String,
        enum: ['master', 'user'],
        default: 'user'
    }
}, { timestamps: true })

export const userModel = mongoose.models.User || mongoose.model('User', userSchema)