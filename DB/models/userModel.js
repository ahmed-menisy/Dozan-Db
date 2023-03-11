import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    wishList: [{
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }],
    orders:[{
        type: mongoose.Types.ObjectId,
        ref: 'Order'
    }],
    role:{
        type:String,
        default:"user",
    }
}, {
    timestamps: true
})
const userModel = new mongoose.model('User',userSchema)
export default userModel