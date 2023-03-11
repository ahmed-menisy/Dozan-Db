import userModel from "../../../DB/models/userModel.js";
import ErrorClass from "../../utils/ErrorClass.js";
import jwt from 'jsonwebtoken';
import {
    StatusCodes
} from 'http-status-codes';


export const addUser = async (req, res, next) => {
    const { email } = req.body;
    const isExist = await userModel.findOne({ email })
    if (isExist) {
        const token = jwt.sign({
            id: isExist._id,
            email: isExist._email
        },process.env.tokenSecret)
        return res.status(StatusCodes.ACCEPTED).json({
            message: "Done",
            token
        })
    }
    const user = new userModel({ email });
    await user.save();
    const token = jwt.sign({
        id: user._id,
        email: user._email
    },process.env.tokenSecret)
    return res.status(StatusCodes.CREATED).json({ message: "Done",token })
}

