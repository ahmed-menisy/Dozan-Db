import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
import cartModel from "../../../DB/models/cartModel.js";
import productModel from "../../../DB/models/productModel.js";
import userModel from "../../../DB/models/userModel.js";



export const addToCart = async (req, res, next) => {
    const { productDetails } = req.body
    const user = req.user._id
    const product = await productModel.findById(productDetails.product)
    if (!product) {
        return next(new ErrorClass("Product not found", 404))
    }
    const cart = await cartModel.findOne({ user})
    const productExist = cart.products.findIndex((ele) => {
        return ele.product == productDetails.product
    })
    // console.log({ productExist });
    if (productExist == -1) {
        // const upd = cart.products.push(productDetails)
        const cart = await cartModel.updateOne({ user }, {
            $push: {
                products: productDetails
            }
        })
    } else {
        cart.products[productExist].quantity = cart.products[productExist].quantity + productDetails.quantity
        await cart.save();
    }
    res.status(StatusCodes.CREATED).json({ message: "message", cart })
}


export const getUserCart = async (req, res, next) => {
    const user = req.user._id

    const carts = await cartModel.findOne({ user }).populate([{
        path: 'products.product',
        select: 'title price description video images mainImage'
    }])
    let totalCost = 0;
    for (const product of carts.products) {
        totalCost += Number(product.product.price) * Number(product.quantity)
    }
    res.status(StatusCodes.ACCEPTED).json({ result: carts, totalCost })
}

export const deleteProduct = async (req, res, next) => {
    const orderID = req.params._id
    const order = await orderModel.findById(orderID)

    if (!order) {
        return next(new ErrorClass("Order not found", 404))
    }
    const user = req.user._id

    if (order.user.toString() != user) {
        return next(new ErrorClass("you are not allowed to delete this order", StatusCodes.UNAUTHORIZED))
    }
    const deletedOrder = await orderModel.deleteOne({ _id: order._id })
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: deletedOrder })
}


export const getOrders = async (req, res, next) => {
    const { status } = req.query
    const delivered = {
        all: {
            $or: [
                { delivered: true }, { delivered: false }
            ]
        },
        delivered: { delivered: true },
        not_delivered: { delivered: false }
    }
    const orders = await orderModel.find(delivered[status]).populate([{
        path: 'user',
        select: 'email '
    }, {
        path: 'products',
        select: 'title price description video images mainImage rate reviewNo'
    }])

    res.status(StatusCodes.ACCEPTED).json({ result: orders })
}

