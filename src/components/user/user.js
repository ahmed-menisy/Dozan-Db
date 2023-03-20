import userModel from "../../../DB/models/userModel.js";
import ErrorClass from "../../utils/ErrorClass.js";
import jwt from 'jsonwebtoken';
import bcryptjs from "bcryptjs"
import {
    StatusCodes
} from 'http-status-codes';
import cartModel from "../../../DB/models/cartModel.js";


// export const addUser = async (req, res, next) => {
//     const { email } = req.body;
//     const isExist = await userModel.findOne({ email })
//     if (isExist) {
//         const token = jwt.sign({
//             id: isExist._id,
//             email: isExist._email
//         }, process.env.tokenSecret)
//         return res.status(StatusCodes.ACCEPTED).json({
//             message: "Done",
//             token
//         })
//     }
//     const user = new userModel({ email });
//     await user.save();
//     const token = jwt.sign({
//         id: user._id,
//         email: user._email
//     }, process.env.tokenSecret)
//     const cart = new cartModel({ user: user._id })
//     await cart.save();
//     return res.status(StatusCodes.CREATED).json({ message: "Done", token })
// }

export const signUp = async (req, res, next) => {
    const { name, email, password } = req.body;
    const isExist = await userModel.findOne({ email })
    if (isExist) {
        return next(new ErrorClass("email exist", StatusCodes.BAD_REQUEST))
    }
    const hashedPass = bcryptjs.hashSync(password, Number(process.env.salt))
    let newUser = new userModel({ name, email, password: hashedPass })
    newUser = await newUser.save()
    const cart = new cartModel({ user: newUser._id })
    await cart.save();
    res.status(201).json({ message: "Done" });
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (user) {
        const isCorrect = bcryptjs.compareSync(password, user.password)
        if (isCorrect) {
            const userData = {
                name: user.name,
                email: user.email,
                id: user._id
            }
            const token = jwt.sign(userData, "node")
            await userModel.findByIdAndUpdate(user._id, { isLoggedIn: true })
            res.json({ message: "Done", token })
        } else {
            return res.json({ message: "in-valid user information" });
        }
    } else {
        return res.json({ message: "in-valid user information" });
    }
}