import userModel from "../../../DB/models/userModel.js";
import ErrorClass from "../../utils/ErrorClass.js";
import jwt from 'jsonwebtoken';
import bcryptjs from "bcryptjs"
import {
    StatusCodes
} from 'http-status-codes';
import cartModel from "../../../DB/models/cartModel.js";
import { createHtml, sendEmail } from "../../utils/sendEmail.js";


export const signUp = async (req, res, next) => {
    const { name, email, password } = req.body;
    const isExist = await userModel.findOne({ email })
    if (isExist) {
        return next(new ErrorClass("email exist", StatusCodes.BAD_REQUEST))
    }
    const hashedPass = bcryptjs.hashSync(password, 5)
    let newUser = new userModel({ name, email, password: hashedPass })
    newUser = await newUser.save()
    const payload = {
        id: newUser._id,
        email: email,
        role: newUser.role
    }

    const token = jwt.sign(payload, 'Dozan')

    const link = `${req.protocol}://${req.headers.host}/api/v1/users/confirm/${token}`
    const object = `                                                    
    <td align="center" style="border-radius: 3px;" bgcolor="#BD903E"><a
      href="${link}" target="_blank"
      style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #BD903E; display: inline-block;">Confirm
      Account</a>
    </td>
  `
    let html = createHtml(object)
    await sendEmail(email, "Dozan email confirmation", html)

    const cart = new cartModel({ user: newUser._id })
    await cart.save();
    res.status(201).json({ message: "Done" });
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (user) {
        if (!user.confirmed) {
            return next(new ErrorClass('please confirm your email', StatusCodes.BAD_REQUEST));
        }

        const isCorrect = bcryptjs.compareSync(password, user.password)
        if (isCorrect) {
            const userData = {
                name: user.name,
                email: user.email,
                id: user._id
            }
            const token = jwt.sign(userData, 'Dozan')
            user.isLoggedIn = true
            await user.save()

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
    token = jwt.verify(token, 'Dozan')
    const user = await userModel.findById(token.id).select('email name')
    if (!user) {
        res.json({ message: false })
    }
    res.json({ message: true, user })
}

export const confirmEmail = async (req, res) => {
    const token = req.params.token;
    const tokenDetails = jwt.verify(token, 'Dozan')
    const user = await userModel.findByIdAndUpdate(tokenDetails.id, { confirmed: true }, { new: true })
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    res.redirect('https://google.com');
}

export const logOut = async (req, res) => {
    await userModel.findByIdAndUpdate(req.user._id, { isLoggedIn: false })
    res.json({ message: "Log Out successfully" })
}



export const SendCode = async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" })
    }
    if (!user.confirmed) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "not confirmed" })
    }
    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    await userModel.updateOne({ _id: user.id }, { code })
    const subject = "reset password"
    const html = `  
    <p 
    style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #000000; text-decoration: none; color: #000000;
    text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #BD903E; display: inline-block;">Use This code to reset your password
</p>
                         
         <p 
            style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #000000; text-decoration: none; color: #000000;
            text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #BD903E; display: inline-block;">${code}
       </p>
  `

    await sendEmail(user.email, subject, html)

    res.json({ message: "check your email" })
}

export const changePass = async (req, res) => {
    const { email, code, password } = req.body;
    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" })
    }
    if (user.code != code) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "in-valid code" })
    }
    const hashedPass = bcryptjs.hashSync(password, 5);
    const min = 100000;
    const max = 999999;
    const newcode = Math.floor(Math.random() * (max - min + 1)) + min;

    await userModel.findByIdAndUpdate(user._id, { password: hashedPass, code: newcode })
    return res.status(StatusCodes.ACCEPTED).json({ message: "Done" })
}