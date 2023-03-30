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
    res.status(StatusCodes.ACCEPTED).json({ message: "done", result: review });
}
export const update = async (req, res, next) => {
    const { reviewId } = req.params
    // check for review
    const review = await reviewModel.findById(reviewId)
    if (!review) {
        return next(new ErrorClass("in-valid review ID", 404))
    }

    const user = req.user._id;
    // check if the user is authorized to update this review or not
    if (review.user.toString() != user) {
        return next(new ErrorClass("You are not allowed to update this review"))
    }

    const { rate, comment } = req.body;
    if (rate != review.rate) {
        const product = await productModel.findById(review.product);
        const sum = (product.rate * product.reviewNo) + rate - review.rate
        const newRate = sum / product.reviewNo
        product.rate = newRate
        await product.save()
    }
    review.rate = rate
    review.comment = comment
    await review.save();
    res.status(StatusCodes.ACCEPTED).json({ message: "done", result: review });
}
export const deleteReview = async (req, res, next) => {
    const { reviewId } = req.params
    // check for review
    const review = await reviewModel.findById(reviewId)
    if (!review) {
        return next(new ErrorClass("in-valid review ID", 404))
    }

    const user = req.user._id;
    // check if the user is authorized to update this review or not
    if (review.user.toString() != user) {
        return next(new ErrorClass("You are not allowed to update this review"))
    }
    const product = await productModel.findById(review.product);
    const sum = (product.rate * product.reviewNo) - review.rate
    let newRate = sum / (product.reviewNo - 1)
    if (!newRate) {
        newRate = 0
    }
    product.rate = newRate

    product.reviewNo = product.reviewNo - 1
    await product.save()

    const deleted = await reviewModel.deleteOne({ _id: reviewId })
    res.status(StatusCodes.ACCEPTED).json({ message: "done", result: "deleted" });
}
export const getAllReviews = async (req, res) => {
    let reviews = await reviewModel.find().populate([
        {
            path: "user",
            select: "email"
        },
        {
            path: "product"
        }
    ]).select('_id');
    reviews = reviews.filter(review => review.product != null)
    res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: reviews })
}

