import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    video: {
        type: String,
        default: ""
    },
    images: [{
        type: String,
    }],
    mainImage: {
        type: String,
        default: ""
    },
    rate: {
        type: Number,
        default: null
    },
    reviewNo: {
        type: Number,
        default: null
    },
}, {
    timestamps: true
})

const productModel = new mongoose.model('Product', productSchema)
export default productModel


/*** */