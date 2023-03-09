import mongoose, { connections } from 'mongoose';

const connection = async () => {
    return mongoose.connect(process.env.DBconnection).then(() => {
        console.log("DB connection established");
    }).catch(err => {
        console.log("DB connection error: ", err);
    })
}

export default connection