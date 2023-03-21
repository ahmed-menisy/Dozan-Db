import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
import productModel from "../../../DB/models/productModel.js";
import userModel from "../../../DB/models/userModel.js";



export const addToFavourite = async (req, res, next) => {
    const { productId } = req.body
    const user = req.user
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new ErrorClass("Product not found", 404))
    }
    const index = user.wishList.indexOf(productId);
    if (index === -1) {
        // Product not in wishlist, add it
        user.wishList.push(productId);
    } else {
        // Product already in wishlist, remove it
        user.wishList.splice(index, 1);
    }
    await user.save();
    const wishList = await userModel.findById(user).populate([{
        path: 'wishList',
        select: 'title price mainImage rate',
    }])
    res.status(StatusCodes.CREATED).json({ message: "message", result: wishList.wishList })
}


export const getUserWishList = async (req, res, next) => {
    const wishList = await userModel.findById(req.user._id).populate([{
        path: 'wishList',
        select: 'title price mainImage rate'
    }])

    res.status(StatusCodes.ACCEPTED).json({ result: wishList.wishList })
}