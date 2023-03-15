import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    rate: {
        type: Number,
        required: true,
        enum: [0,1, 2, 3, 4, 5]
    },
    comment: {
        type: String,
        required: true
    }

}, {
    timestamps: true
})

const reviewModel = new mongoose.model('Review', reviewSchema)
export default reviewModel

