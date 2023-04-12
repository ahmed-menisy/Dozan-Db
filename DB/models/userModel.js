import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['origin', 'google'],
        default: 'origin'
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    wishList: [{
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }],
    role: {
        type: String,
        default: "user",
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    code: {
        type: Number,
    },
    isLoggedIn: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
})
const userModel = new mongoose.model('User', userSchema)
export default userModel