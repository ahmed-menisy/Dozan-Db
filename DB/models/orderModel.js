import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    phone: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    products: [{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Product'
    }],
    totalCost: {
        type: Number,
        required: true
    },
    comment: {
        type: String
    },
    delivered: {
        type: Boolean,
        default: false
    },
    payMethod: {
        type: String,
        default: "Visa"
    }
}, {
    timestamps: true
})

const orderModel = new mongoose.model('Order', orderSchema)
export default orderModel