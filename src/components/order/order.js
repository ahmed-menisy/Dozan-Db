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
import { paginate } from "../../utils/pagination.js";
import paypalOrderModel from "../../../DB/models/paypalOrders.js";
const stripe = new Stripe(process.env.stripe_secret)
import paypal from "paypal-rest-sdk";


paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id: process.env.Client_ID,
    client_secret: process.env.Client_secret,
});




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
        path: 'user',
        select: 'email name'
    }, {
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
                currency: 'ILS',
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
        removedProduct: `Products with IDs [ ${notFound.map(product => product.product).join(', ')} ] has been removed`, payment_url: session.url
    }) :
        res.status(StatusCodes.ACCEPTED).json({ message: "Done", payment_url: session.url })
}

export const webhookCheckout = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.webhook_secret);
    if (event.type == 'checkout.session.completed') {
        console.log('create order');
    }
    let { phone, address, products, comment, totalCost, user } = event.data.object.metadata
    products = JSON.parse(products)
    user = JSON.parse(user)
    let order = new orderModel({ phone, address, products, comment, totalCost, user })
    order = await order.save();
    res.json({ message: "Done", order });
}


export const paypalCheckOut = async (req, res, next) => {
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
    let paid = new paypalOrderModel({ user, phone, address, products: founded, comment, totalCost })
    paid = await paid.save();
    //* create paypal

    const create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal",
        },
        redirect_urls: {
            return_url: `${req.protocol}://${req.headers.host}/api/v1/order/success/${paid._id}`,
            cancel_url: `${req.protocol}://${req.headers.host}/api/v1/order/cancel/${paid._id}`,
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: req.user.name,
                            price: totalCost,
                            currency: "ILS",
                            quantity: 1,
                        },
                    ],
                },
                amount: {
                    currency: "ILS",
                    total: totalCost,
                },
            },
        ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            res.json(error);
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                    res.json({ message: "Done", paymentURL: payment.links[i].href })
                }
            }
        }
    });
}



export const success = async (req, res) => {
    const payId = req.params.payId
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const order = await paypalOrderModel.findByIdAndDelete(payId)
    const { phone, address, products, comment, totalCost, user } = order
    const execute_payment_json = {
        payer_id: payerId,
        transactions: [{
            amount: {
                currency: 'ILS',
                total: order.totalCost,
            },
        }],
    };
    paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async (error, payment) => {
            if (error) {
                res.json({ message: error.response });//* it will replace by the front end 

            } else {

                let order = new orderModel({ phone, address, products, comment, totalCost, user })
                order = await order.save();
                res.json({ message: "Done", order });//* it will replace by the front end 
            }
        }
    );

}

export const cancel = async (req, res) => {
    const payId = req.params.payId
    await paypalOrderModel.findByIdAndDelete(payId)
    res.json({ message: "Canceled" });

}