import userModel from "../../../DB/models/userModel.js";
import ErrorClass from "../../utils/ErrorClass.js";
import jwt from 'jsonwebtoken';
import bcryptjs from "bcryptjs"
import {
    StatusCodes
} from 'http-status-codes';
import cartModel from "../../../DB/models/cartModel.js";


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
            const token = jwt.sign(userData,process.env.tokenSecret)
            await userModel.findByIdAndUpdate(user._id, { isLoggedIn: true })
            res.json({ message: "Done", token })
        } else {
            return res.json({ message: "in-valid user information" });
        }
    } else {
        return res.json({ message: "in-valid user information" });
    }
}


export const checkToken = async (req, res, next) => {
    let { token } = req.body
    token = jwt.verify(token, process.env.tokenSecret)
    const user = await userModel.findById(token.id).select('email name')
    if (!user) {
        return next(new ErrorClass(false, 404))
    }
    res.json({ message: true, user })
}