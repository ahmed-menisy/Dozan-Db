import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique:true,
        required: true,
    },
    products: [{
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }]
}, {
    timestamps: true
})

const categoryModel = new mongoose.model('Category', categorySchema)
export default categoryModel
