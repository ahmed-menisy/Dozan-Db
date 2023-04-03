import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
import cartModel from "../../../DB/models/cartModel.js";
import productModel from "../../../DB/models/productModel.js";



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
    if (productExist == -1) {
        // const upd = cart.products.push(productDetails)
        const cart = await cartModel.findOneAndUpdate({ user }, {
            $push: {
                products: productDetails
            }
        }, { new: true })
        return res.status(StatusCodes.CREATED).json({ message: "Done", cart })

    } else {
        cart.products[productExist].quantity = cart.products[productExist].quantity + productDetails.quantity
        await cart.save();
    }
    res.status(StatusCodes.CREATED).json({ message: "Done", cart })
}


export const getUserCart = async (req, res, next) => {
    const user = req.user._id

    let carts = await cartModel.findOne({ user }).populate([{
        path: 'products.product',
        select: 'title price oldPrice description mainImage',
    }])
    carts.products = carts.products.filter(product => {
        return product.product != null
    })
    await carts.save()
    let totalCost = 0;
    for (const product of carts.products) {
        totalCost += Number(product.product.price) * Number(product.quantity)
    }
    res.status(StatusCodes.ACCEPTED).json({ result: carts, totalCost })
}

export const updateCart = async (req, res, next) => {
    const productId = req.params._id
    const user = req.user._id
    const { quantity } = req.body;
    const cart = await cartModel.findOneAndUpdate(
        { user, 'products.product': productId },
        { $set: { 'products.$.quantity': quantity } },
        { new: true }
    ).populate([{
        path: 'products.product',
        select: 'title price description mainImage'
    }])
    if (!cart) {
        return next(new ErrorClass("product not found", StatusCodes.NOT_FOUND));
    }
    let totalCost = 0
    cart.products = cart.products.filter(product => {
        return product.product != null
    })
    await cart.save()
    console.log({ cart: cart.products });
    for (const product of cart.products) {
        totalCost += Number(product.product.price) * Number(product.quantity)
    }
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: cart.products, totalCost })
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