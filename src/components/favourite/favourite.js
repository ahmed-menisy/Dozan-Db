import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
import cartModel from "../../../DB/models/cartModel.js";
import productModel from "../../../DB/models/productModel.js";
import userModel from "../../../DB/models/userModel.js";



export const addToFavourite = async (req, res, next) => {
    const { productId } = req.body
    const user = req.user
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new ErrorClass("Product not found", 404))
    }
    console.log({ user });
    const index = user.wishList.indexOf(productId);
    if (index === -1) {
        // Product not in wishlist, add it
        user.wishList.push(productId);
    } else {
        // Product already in wishlist, remove it
        user.wishList.splice(index, 1);
    }
    await user.save();


    res.status(StatusCodes.CREATED).json({ message: "message", result: user.wishList })
}


export const getUserWishList = async (req, res, next) => {
    const wishList = await userModel.findById(req.user._id).populate([{
        path: 'wishList',
        select: 'title price description video images mainImage rate reviewNo'
    }])

    res.status(StatusCodes.ACCEPTED).json({ result: wishList.wishList })
}

export const deleteProduct = async (req, res, next) => {
    const user = req.user._id
    const productId = req.params.productId
    const cart = await cartModel.findOne({ user });

    // find the index of the product subdocument in the products array
    const productIndex = cart.products.findIndex((product) => product.product.equals(productId));

    if (productIndex === -1) {
        return next(new ErrorClass('Product not found in cart', 404));
    }

    // remove the product subdocument at the specified index
    cart.products.splice(productIndex, 1);

    await cart.save();

    res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: cart })
}

export const getWishlist= async (req, res, next) => {
    const wishList = await orderModel.find().populate([{
        path: 'wishList',
        select: 'title price description video images mainImage rate reviewNo'
    }])

    res.status(StatusCodes.ACCEPTED).json({ result: wishList })
}

