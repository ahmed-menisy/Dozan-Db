import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'User'
    },
    phone:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'User'
    },
    address:{
        type:String,
        required:true,
    },
    products:[{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'Product'
    }],
    totalCost:{
        type:Number,
        required:true
    },
    comment:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

const orderModel = new mongoose.model('Order',orderSchema)
export default orderModel