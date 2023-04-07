import { config } from "dotenv";
config()
import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
import orderModel from "../../../DB/models/orderModel.js";
import productModel from "../../../DB/models/productModel.js";
import cartModel from "../../../DB/models/cartModel.js";
import userModel from "../../../DB/models/userModel.js";
import { paginate } from "../../utils/pagination.js";
import moment from "moment/moment.js";
import fx from "money";
export const updateOrder = async (req, res, next) => {
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
        founded.push({ product: orderProduct.product, quantity: orderProduct.quantity });
    }
    if (notFound.length == products.length) {
        return next(new ErrorClass("All products not found", 404))
    }

    const updatedOrder = await orderModel.updateOne({ _id: order._id }, { phone, address, products: founded, comment })
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", InValidProductId: notFound, result: updatedOrder })
}

export const deleteOrder = async (req, res, next) => {
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
    const { status, page, size } = req.query
    const delivered = {
        all: {
            $or: [
                { delivered: true }, { delivered: false }
            ]
        },
        delivered: { delivered: true },
        not_delivered: { delivered: false }
    }
    const { skip, limit } = paginate(page, size)
    let orders = await orderModel.find(delivered[status]).populate([{
        path: 'user',
        select: 'email name'
    }, {
        path: 'products.product',
        select: 'title oldPrice price description mainImage'
    }])
    let totalCost = 0
    for (const order of orders) {
        order.products = order.products.filter(product => {
            return product.product != null
        })
        await order.save()
        for (const product of order.products) {
            totalCost += product.product.price * product.quantity;
        }
        order._doc.totalCost = totalCost
        totalCost = 0
    }
    orders = orders.reverse()
    const ordersCount = orders.length;
    orders = orders.splice(skip, limit)
    const totalPages = Math.ceil(ordersCount / size)
    return res.status(StatusCodes.ACCEPTED).json({
        result: orders,
        ordersCount,
        totalPages,
        page
    })
}

export const getUserOrders = async (req, res, next) => {
    const { status } = req.query
    const { userId } = req.params
    const user = await userModel.findById(userId)
    if (!user) {
        return next(new ErrorClass("user not found", 404))
    }
    const delivered = {
        all: {
            $or: [
                { delivered: true }, { delivered: false }
            ]
        },
        delivered: { delivered: true },
        not_delivered: { delivered: false }
    }
    delivered.user = userId
    let orders = await orderModel.find(delivered[status]).populate([{
        path: 'user',
        select: 'email name'
    }, {
        path: 'products.product',
        select: 'title price description mainImage'
    }])
    let totalCost = 0
    for (const order of orders) {
        order.products = order.products.filter(product => {
            return product.product != null
        })
        await order.save()
        for (const product of order.products) {
            totalCost += product.product.price * product.quantity;
        }
        order._doc.totalCost = totalCost
        totalCost = 0
    }
    orders = orders.reverse()

    res.status(StatusCodes.ACCEPTED).json({ result: orders })
}

export const orderById = async (req, res, next) => {
    const { _id } = req.params
    let totalCost = 0
    const order = await orderModel.findById(_id).populate([{
        path: 'user',
        select: 'email name'
    }, {
        path: 'products.product',
        select: 'title price description mainImage'
    }])
    if (!order) {
        return next(new ErrorClass("Order not found", 404))
    }
    order.products = order.products.filter(product => {
        return product.product != null
    })
    await order.save()
    for (const product of order.products) {
        totalCost += product.product.price * product.quantity;
    }
    order._doc.totalCost = totalCost

    res.status(StatusCodes.ACCEPTED).json({ result: order })
}


export const createOrder = async (req, res, next) => {
    const user = req.user._id; // token 
    const { address, phone } = req.body
    const cart = await cartModel.findOne({ user })

    //* calculate the total price and find removed products
    let notFound = [], founded = [];
    const productsFounded = await productModel.find({
        _id
            : {
            $in: cart.products.map(product => {
                return product.product
            })
        }
    }).select('price');
    // Validate that all the product IDs were found
    if (productsFounded.length !== cart.products.length) {
        notFound = cart.products.filter(product => !productsFounded.find(p => p._id.toString() === product.product));
    }
    for (const product of productsFounded) {
        const orderProduct = cart.products.find(p => p.product.toString() === product._id.toString());
        founded.push({ product: orderProduct.product, quantity: orderProduct.quantity });
    } let order = new orderModel({ phone, address, products: founded, user })
    order = await order.save();
    cart.products = [];
    await cart.save();
    res.json({ message: "Done", order });
}