import jwt from 'jsonwebtoken';
import ErrorClass from '../utils/ErrorClass.js';
import {
    StatusCodes
} from 'http-status-codes';
import adminModel from '../../DB/models/admin.js';
import userModel from '../../DB/models/userModel.js';

export const roles = {
    admin: "admin",
    superAdmin: "superAdmin",
    user: "user"
}
Object.freeze(roles)


export const auth = (roles) => {
    return async (req, res, next) => {
        const startToken = req.headers.token;
        if (startToken) {
            if (startToken.startsWith('Dozan')) {
                const token = startToken.split(' ')[1]
                const userData = jwt.verify(token, 'Dozan')
                let user
                if (roles.includes("user") && userData.role == roles.user) {
                    user = await userModel.findById(userData.id).select('-password')

                } else if (roles.includes("admin") || roles.includes("superAdmin")) {
                    user = await adminModel.findById(userData.id).select('-password')
                }
                if (user) {
                    if (!user.confirmed) {
                        return next(new ErrorClass('please confirm your email', StatusCodes.BAD_REQUEST));
                    }
                    if (!user.isLoggedIn) {
                        return next(new ErrorClass('login first', StatusCodes.BAD_REQUEST));
                    }

                    if (roles.includes(user.role)) {
                        req.user = user
                        next()
                    } else {
                        return next(new ErrorClass('YOU ARE NOT AUTHORIZED TO USE THIS END POINT', StatusCodes.UNAUTHORIZED))
                    }
                } else {
                    return next(new ErrorClass('In-valid user', StatusCodes.NOT_FOUND))
                }
            } else {
                return next(new ErrorClass('In-valid token Start', StatusCodes.NOT_ACCEPTABLE))
            }
        } else {
            return next(new ErrorClass('Please send Token', StatusCodes.NOT_ACCEPTABLE))
        }
    }
}





