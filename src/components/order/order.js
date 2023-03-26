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
import Stripe from "stripe";
const stripe = new Stripe(process.env.stripe_secret)
/**
 * Get user Order
*/


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
        path: 'products.product',
        select: 'title price description mainImage'
    }])

    res.status(StatusCodes.ACCEPTED).json({ result: orders })
}

export const getUserOrders = async (req, res, next) => {
    const { status } = req.query
    const { userId } = req.params
    // console.log({userId});
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
    const orders = await orderModel.find(delivered[status]).populate([{
        path: 'products.product',
        select: 'title price description mainImage'
    }])
    res.status(StatusCodes.ACCEPTED).json({ result: orders })
}

export const checkout = async (req, res, next) => {
    const user = req.user._id
    const { shippingMount, address, phone, comment } = req.body
    const cart = await cartModel.findOne({ user })
    //* calculate the total price and find removed products

    let totalCost = 0
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
    // Calculate the total cost of the order
    for (const product of productsFounded) {
        const orderProduct = cart.products.find(p => p.product.toString() === product._id.toString());

        totalCost += Number(product.price) * Number(orderProduct.quantity);
        founded.push({ product: orderProduct.product, quantity: orderProduct.quantity });
    }
    totalCost += shippingMount


    //* create stripe session

    const session = await stripe.checkout.sessions.create({
        line_items: [{

            price_data: {
                currency: 'usd',
                unit_amount: totalCost * 100,
                product_data: {
                    name: req.user.name
                },
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.headers.host}/api/v1/admin/data`,
        cancel_url: `${req.protocol}://${req.headers.host}/api/v1/category/get-all-categories?sort=sorted`,
        customer_email: req.user.email,
        client_reference_id: cart._id,
        metadata: {
            address,
            phone,
            comment,
            totalCost,
            products: JSON.stringify(founded),
            user: JSON.stringify(req.user._id)
        }
    })

    notFound.length ? res.status(StatusCodes.ACCEPTED).json({
        removedProduct: `Products with IDs [ ${notFound.map(product => product.product).join(', ')} ] not found`, result: totalCost, session: session.url
    }) :
        res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: totalCost, session: session.url })
}

export const webhookCheckout = (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.webhook_secret);
    if (event.type == 'checkout.session.completed') {
        console.log('create order');
    }
    console.log(createOrder(event.data.object.metadata));
}

const createOrder = async (data) => {
    const { phone, address, products, comment } = data
    console.log(data);
    let order = new orderModel({ totalCost, user, phone, address, products: founded, comment })
    return order
}
