import userModel from "../../../DB/models/userModel.js";
import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
 

export const addUser = async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.insertMany({ email });
    // const token  = 
    return res.status(StatusCodes.CREATED).json({message:"Done"})
}