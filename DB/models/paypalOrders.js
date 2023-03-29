import mongoose from 'mongoose';


const product = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true
    }
}, {
    _id: false
})

const paypalOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    products: [product],
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
    }
})

const  paypalOrderModel = new mongoose.model('PaypalOrder',  paypalOrderSchema)
export default paypalOrderModel