import { nanoid } from "nanoid";
import productModel from "../../../DB/models/productModel.js";
import cloudinary from "../../utils/cloudinary.js";
import {
    StatusCodes
} from 'http-status-codes';
import ErrorClass from "../../utils/ErrorClass.js";
import { paginate } from "../../utils/pagination.js";
import reviewModel from "../../../DB/models/reviewModel.js";
import categoryModel from "../../../DB/models/categoryModel.js";
import orderModel from "../../../DB/models/orderModel.js";



export const addProduct = async (req, res, next) => {
    let { title, price, oldPrice, description, categoryId } = req.body
    price = Number(price)
    oldPrice = Number(oldPrice)
    if (oldPrice < price) {
        return next(new ErrorClass("Old price must be greater than or equal new price", StatusCodes.NOT_FOUND))
    }
    const catg = await categoryModel.findById(categoryId)
    if (!catg) {
        return next(new ErrorClass("category not found", StatusCodes.NOT_FOUND))
    }

    const product = await productModel.findOne({ title })
    if (product) {
        return next(new ErrorClass("this title is already taken", StatusCodes.BAD_REQUEST))
    }
    let video, image, added, imagesDB = [];
    if (req.files && req.files.mainImage) {
        console.log({ files: req.files });
        let { mainImage, images, video } = req.files;
        if (mainImage) {
            image = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
                folder: `MainImages/${req.files.mainImage[0].originalname + nanoid()}`,
                public_id: req.files.mainImage[0].originalname + nanoid(),
                use_filename: true,
                unique_filename: false,
                resource_type: "auto"
            })
        }
        if (images) {
            for (const image of req.files.images) {
                const img = await cloudinary.uploader.upload(image.path, {
                    folder: `Images/${image.originalname + nanoid()}`,
                    public_id: image.originalname + nanoid(),
                    use_filename: true,
                    unique_filename: false,
                    resource_type: "auto",

                })
                imagesDB.push(img.secure_url)
            }
        }
        if (video) {
            video = await cloudinary.uploader.upload(req.files.video[0].path, {
                folder: `videos/${req.files.video[0].originalname + nanoid()}`,
                public_id: req.files.video[0].originalname + nanoid(),
                use_filename: true,
                unique_filename: false,
                resource_type: "video"
            })
        }

        added = await productModel.insertMany({
            title,
            price,
            description,
            mainImage: image?.secure_url,
            video: video?.secure_url,
            images: imagesDB,
            category: catg.name,
            oldPrice
        })
    } else {

        return next(new ErrorClass("Please send the main image", StatusCodes.BAD_REQUEST))

    }
    await categoryModel.updateOne({ _id: categoryId }, {
        $push: {
            products: added[0]._id
        }
    })
    res.status(StatusCodes.CREATED).json({ message: "Done", result: added })
}

export const updateProduct = async (req, res, next) => {
    let { title, price, description, oldPrice } = req.body
    const { _id } = req.params;
    price = Number(price)
    oldPrice = Number(oldPrice)

    if (oldPrice < price) {
        return next(new ErrorClass("Old price must be greater than or equal new price", StatusCodes.NOT_FOUND))
    }
    const product = await productModel.findById(_id) // Is product Exist
    if (!product) {
        return next(new ErrorClass("product not found"));
    }
    const anotherProduct = await productModel.findOne({ // to find another product with the same title before update
        title: title, _id: { $ne: product._id }
    })
    if (anotherProduct) {
        return next(new ErrorClass("this title is already taken", StatusCodes.BAD_REQUEST))
    }
    let video, image, updatedProduct, imagesDB = product.images;
    if (req.files) {
        let { mainImage, images, video } = req.files;
        if (mainImage) {
            image = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
                folder: `MainImages/${req.files.mainImage[0].originalname + nanoid()}`,
                public_id: req.files.mainImage[0].originalname + nanoid(),
                use_filename: false,
                unique_filename: false
            })
        }
        if (images?.length) {
            imagesDB = []
            for (const image of req.files.images) {
                const img = await cloudinary.uploader.upload(image.path, {
                    folder: `Images/${image.originalname + nanoid()}`,
                    public_id: image.originalname + nanoid(),
                    use_filename: true,
                    unique_filename: false,
                })
                imagesDB.push(img.secure_url)
            }
        }
        if (video) {
            video = await cloudinary.uploader.upload(req.files.video[0].path, {
                folder: `videos/${req.files.video[0].originalname + nanoid()}`,
                public_id: req.files.video[0].originalname + nanoid(),
                use_filename: true,
                unique_filename: false,
                resource_type: "video"
            })
        }
        updatedProduct = await productModel.updateOne({ _id }, { title, oldPrice, price, description, mainImage: image?.secure_url, video: video?.secure_url, images: imagesDB })
    } else {
        updatedProduct = await productModel.updateOne({ _id }, { title, oldPrice, price, description })
    }
    return res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: updatedProduct })
}

export const deleteProduct = async (req, res, next) => {
    const { _id } = req.params;
    const product = await productModel.findByIdAndDelete({ _id })
    if (!product) {
        return next(new ErrorClass('in-valid-product ID', StatusCodes.NOT_FOUND));
    }
    const ordered = await orderModel.findOne(
        { 'products.product': _id, delivered: false }
    )
    if (ordered) {
        return next(new ErrorClass("You can't delete this product before deliver it for order with id " + ordered._id, StatusCodes.BAD_REQUEST));
    }
    await reviewModel.deleteMany({ product: product._id })
    return res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: product })
}

export const getAllProducts = async (req, res, next) => {
    const { size, page } = req.query
    const { skip, limit } = paginate(page, size)
    let products = []
    products = await productModel.find()
    products = products.reverse()
    const productsCount = products.length;
    products = products.splice(skip, limit)
    const totalPages = Math.ceil(productsCount / size)
    return res.status(StatusCodes.ACCEPTED).json({
        result: products,
        productsCount,
        totalPages,
        page
    })
}

export const getProductById = async (req, res, next) => {
    const { productId } = req.params;
    let product = await productModel.findById(productId)

    if (!product) {
        return next(new ErrorClass('No product found', StatusCodes.NOT_FOUND));
    }
    const reviews = await reviewModel.find({ product: productId })
    product.reviews = reviews
    return res.status(StatusCodes.ACCEPTED).json({ result: product, reviews })
}

export const sort = async (req, res, next) => {
    const { size, page } = req.query
    const { skip, limit } = paginate(page, size)
    const products = await productModel.find().skip(skip).limit(limit).sort({ rate: -1, reviewNo: 1 })

    if (!products.length) {
        return next(new ErrorClass('No products available', StatusCodes.NOT_FOUND));
    }
    return res.status(StatusCodes.ACCEPTED).json({ result: products })
}