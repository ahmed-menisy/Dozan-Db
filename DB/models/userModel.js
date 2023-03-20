import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
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
    phone: {
        type: String,
    },
    address:{
        type: String,
    }
}, {
    timestamps: true
})
const userModel = new mongoose.model('User', userSchema)
export default userModel