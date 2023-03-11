import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
import orderModel from "../../../DB/models/orderModel.js";
import productModel from "../../../DB/models/productModel.js";

export const createOrder = async (req, res, next) => {
    const { phone, address, products, comment } = req.body
    const user = req.user._id
    let totalCost = 0
    let notFound = [], founded = []
    const productsFounded = await productModel.find({
        _id: {
            $in: products
        }
    }).select('_id price')
    founded = productsFounded.map(product => {
        totalCost += Number(product.price)
        return product._id.toString()
    })
    products.map((product) => {
        if (!founded.includes(product)) {
            notFound.push(product)
        }
    })
    if (notFound.length == products.length) {
        return next(new ErrorClass("all IDs not found", StatusCodes.NOT_FOUND))
    }
    const order = new orderModel({ totalCost, user, phone, address, products: founded, comment })
    const Order = await order.save()
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", InValidProductId: notFound, result: Order })
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
    let notFound = [], founded = []
    const productsFounded = await productModel.find({
        _id: {
            $in: products
        }
    }).select('_id price')
    founded = productsFounded.map(product => {
        totalCost += Number(product.price)
        return product._id.toString()
    })
    products.map((product) => {
        if (!founded.includes(product)) {
            notFound.push(product)
        }
    })
    if (notFound.length == products.length) {
        return next(new ErrorClass("all product IDs not found", StatusCodes.NOT_FOUND))
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
        path:'user',
        select:'email '
    },{
        path:'products',
        select:'title price description video images mainImage rate reviewNo'
    }])

    res.status(StatusCodes.ACCEPTED).json({ result: orders })
}