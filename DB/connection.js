import mongoose, { connections } from 'mongoose';

const connection = async () => {
    return mongoose.connect('mongodb+srv://Anas:Eng_anas_121201101459565@cluster0.gkhmpi7.mongodb.net/Dozan?retryWrites=true&w=majority').then(() => {
        console.log("DB connection established");
    }).catch(err => {
        console.log("DB connection error: ", err);
    })
}

export default connection