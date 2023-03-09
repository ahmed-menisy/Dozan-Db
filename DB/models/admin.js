import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name:{ 
        type:"String",
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role:{
        type:String,
        default:"admin",
        enum:["admin","supperAdmin"]
    },
    password:{
        type:String,
        required: true
    }
}, {
    timestamps: true
})
const adminModel = new mongoose.model('Admin',adminSchema)
export default adminModel