import bcryptjs from 'bcryptjs';
import adminModel from '../../../DB/models/admin.js';
import {
    StatusCodes
} from 'http-status-codes';
import ErrorClass from '../../utils/ErrorClass.js';
import jwt from 'jsonwebtoken';
import { roles } from '../../middleware/auth.js';


export const addAdmin = async (req, res, next) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, +process.env.salt)
    const AdminAdded = await adminModel.insertMany({ name, email, password: hashedPassword })
    return res.status(StatusCodes.CREATED).json({ message: "Done", result: AdminAdded });
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;
    const isExist = await adminModel.findOne({ email });
    if (!isExist) {
        return next(new ErrorClass('invalid login information', StatusCodes.BAD_REQUEST));
    }
    const pass = bcryptjs.compareSync(password, isExist.password)
    if (!pass) {
        return next(new ErrorClass('invalid login information', StatusCodes.BAD_REQUEST));
    }
    // token 
    const payload = {
        id: isExist._id,
        email: isExist.email,
        role: isExist.role
    }
    const token = jwt.sign(payload, process.env.TokenStart)
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", token })
}

export const changePassword = async (req, res, next) => {
    const { oldPass, newPass } = req.body;
    const id = req.user.id
    const user = await adminModel.findById(id);
    const correctPass = bcryptjs.compareSync(oldPass, user.password)
    if (!correctPass) {
        return next(new ErrorClass('invalid password', StatusCodes.BAD_REQUEST))
    }
    const newpassHashed = bcryptjs.hashSync(newPass, +process.env.salt)
    const upatedUser = await adminModel.findByIdAndUpdate(id, { password: newpassHashed }, { new: true })
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: upatedUser })
}


export const update = async (req, res, next) => {
    const { name } = req.body;
    const _id = req.user.id;
    const user = await adminModel.findByIdAndUpdate(_id, { name }, { new: true });
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: user })
}


export const deleteAdmin = async (req, res, next) => {
    const { id } = req.params
    const user = await adminModel.findById(id);
    if (!user) {
        return next(new ErrorClass("invalid user Id", StatusCodes.NOT_FOUND))
    }
    // super admin email can't be deleted 
    if (user.role == roles.superAdmin) {
        return next(new ErrorClass("Super admin can't be deleted... if you want to delete it contact the administrator", StatusCodes.FORBIDDEN))
    }
    await adminModel.deleteOne({ _id: id })
    res.status(StatusCodes.ACCEPTED).json({ message: "Deleted" })
}