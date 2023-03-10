import jwt from 'jsonwebtoken';
import ErrorClass from '../utils/ErrorClass.js';
import {
    StatusCodes
} from 'http-status-codes';
import adminModel from '../../DB/models/admin.js';

export const roles = {
    admin:"admin",
    superAdmin:"superAdmin",
}
Object.freeze(roles)


export const auth =  (roles) => {
    return async (req, res, next) => {
        const startToken = req.headers.token;
        if (startToken) {
            if (startToken.startsWith(process.env.TokenStart)) {
                const token = startToken.split(' ')[1]
                const userData = jwt.verify(token, process.env.tokenSecret)
                const user = await adminModel.findById(userData.id).select('-password')
                if (user) {
                    if (roles.includes(user.role)) {
                        req.user = user
                        next()
                    } else {
                        return next(new ErrorClass('YOU ARE NOT AUTHORIZED TO USE THIS END POINT', StatusCodes.FORBIDDEN))
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





