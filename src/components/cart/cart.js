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



    const cart = await cartModel.findOne({ user })

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
        cart.products[productExist].quantity = cart.products[productExist].quantity + 1
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

export const updateProduct = async (req, res, next) => {
    const orderID = req.params._id
    const order = await orderModel.findById(orderID)
    if (!order) {
        return next(new ErrorClass("Order not found", 404))
    }
    const user = req.user._id
    if (order.user.toString() != user) {
        return next(new ErrorClass("you are not allowed to update this order", StatusCodes.UNAUTHORIZED))
    }

    const { phone, address, products, comment } = req.body
    let totalCost = 0
    let notFound = [], founded = [];
    const productsFounded = await productModel.find({ _id: { $in: products.map(product => product.product) } });
    // Validate that all the product IDs were found
    if (productsFounded.length !== products.length) {
        notFound = products.filter(product => !productsFounded.find(p => p._id.toString() === product.product));
    }
    // Calculate the total cost of the order
    for (const product of productsFounded) {
        const orderProduct = products.find(p => p.product === product._id.toString());
        totalCost += Number(product.price) * Number(orderProduct.quantity);
        founded.push({ product: orderProduct.product, quantity: orderProduct.quantity });
    }
    if (notFound.length == products.length) {
        return next(new ErrorClass("All products not found", 404))
    }

    const updatedOrder = await orderModel.updateOne({ _id: order._id }, { totalCost, phone, address, products: founded, comment })
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", InValidProductId: notFound, result: updatedOrder })
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

export const markAsDelivered = async (req, res, next) => {
    const { _id } = req.params;
    const order = await orderModel.findById(_id).select('delivered')
    if (!order) {
        return next(new ErrorClass("Order not found", 404))
    }
    const delivered = await orderModel.updateOne({ _id: order._id }, { delivered: !order.delivered })
    res.json({ delivered });
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

