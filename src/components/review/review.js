import productModel from "../../../DB/models/productModel.js";
import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
import reviewModel from "../../../DB/models/reviewModel.js";


export const createReview = async (req, res, next) => {
    const { productId, rate, comment } = req.body;
    const user = req.user._id;
    const product = await productModel.findById(productId);
    console.log({product});
    if (!product) {
        return next(new ErrorClass("in-valid product Id", StatusCodes.NOT_FOUND))
    }
    let review = new reviewModel({ product: product._id, rate, comment, user })
    review = await review.save();
    const sum = (product.rate * product.reviewNo) + rate
    const no = product.reviewNo + 1
    const newRate = sum / no
    product.rate = newRate
    product.reviewNo = no
    await product.save()
    console.log({sum, newRate, no, rate });

    res.status(StatusCodes.ACCEPTED).json({ message: "done", result: review });
}