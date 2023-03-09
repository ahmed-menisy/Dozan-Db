import { nanoid } from "nanoid";
import productModel from "../../../DB/models/productModel.js";
import cloudinary from "../../utils/cloudinary.js";
import {
    StatusCodes
} from 'http-status-codes';
import ErrorClass from "../../utils/ErrorClass.js";



export const addProduct = async (req, res, next) => {
    const { title, price, description } = req.body

    const product = await productModel.findOne({ title })
    if (product) {
        return next(new ErrorClass("this title is already taken", StatusCodes.BAD_REQUEST))
    }
    console.log(req.file);
    let image, added;
    if (req.file) {
        image = await cloudinary.uploader.upload(req.file.path, {
            folder: `MainImages/${req.file.originalname + nanoid()}`,
            public_id: req.file.originalname + nanoid(),
            use_filename: true,
            unique_filename: false
        })
        console.log({ image });
        added = await productModel.insertMany({ title, price, description, mainImage: image.secure_url })

    } else {
        added = await productModel.insertMany({ title, price, description })
    }
    res.status(StatusCodes.CREATED).json({ message: "Done", result: added })

}

export const updateProduct = async (req, res, next) => {
    const { title, price, description } = req.body
    const { _id } = req.params;
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
    const updatedProduct = await productModel.updateOne({ _id }, { title, price, description })
    return res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: updatedProduct })

}

export const deleteProduct = async (req, res, next) => {
    const { _id } = req.params;
    const product = await productModel.findByIdAndDelete({ _id })
    if (!product) {
        return next(new ErrorClass('in-valid-product ID', StatusCodes.NOT_FOUND));
    }
    return res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: product })
}

export const getAllproducts = async (req, res, next) => {
    const products = await productModel.find()

    if (!products.length) {
        return next(new ErrorClass('No products available', StatusCodes.NOT_FOUND));
    }
    return res.status(StatusCodes.ACCEPTED).json({ result: products })
}

export const updateMainImage = async (req, res, next) => {
    console.log(req.file);
    if (!req.file) {
        return next(new ErrorClass("please send the Main Image", StatusCodes.BAD_REQUEST))
    }
    const { _id } = req.params
    const product = await productModel.findById(_id);
    if (!product) {
        return next(new ErrorClass("product not found", StatusCodes.NOT_FOUND))
    }
    const image = await cloudinary.uploader.upload(req.file.path, {
        folder: `MainImages/${req.file.originalname + nanoid()}`,
        public_id: req.file.originalname + nanoid(),
        use_filename: true,
        unique_filename: false
    })
    console.log({ image });
    const updated = await productModel.updateOne({ _id }, { mainImage: image.secure_url })
    res.json({ value: "Done", updated });
}

export const updateVideo = async (req, res, next) => {
    console.log(req.file);
    if (!req.file) {
        return next(new ErrorClass("please send the Main Image", StatusCodes.BAD_REQUEST))
    }
    const { _id } = req.params
    const product = await productModel.findById(_id);
    if (!product) {
        return next(new ErrorClass("product not found", StatusCodes.NOT_FOUND))
    }
    const video = await cloudinary.uploader.upload(req.file.path, {
        folder: `videos/${req.file.originalname + nanoid()}`,
        public_id: req.file.originalname + nanoid(),
        use_filename: true,
        unique_filename: false,
        resource_type: "video"
    })
    const updated = await productModel.updateOne({ _id }, { video: video.secure_url })
    res.json({ value: "Done", updated });
}

export const udpateImages = async (req, res, next) => {
    // console.log(req.files);
    console.log({ body: req.body });
    if (!req.files || !req.files.length) {
        return next(new ErrorClass("please send the Main Image", StatusCodes.BAD_REQUEST))
    }
    const images = req.files
    const { _id } = req.params
    const product = await productModel.findById(_id);
    if (!product) {
        return next(new ErrorClass("product not found", StatusCodes.NOT_FOUND))
    }
    const imagesDB = product.images
    for (const image of images) {
        const img = await cloudinary.uploader.upload(image.path, {
            folder: `Images/${image.originalname + nanoid()}`,
            public_id: image.originalname + nanoid(),
            use_filename: true,
            unique_filename: false,
        })
        console.log(img.secure_url);
        imagesDB.push(img.secure_url)
    }
    console.log({ imagesDB });
    const updated = await productModel.updateOne({ _id }, { images: imagesDB })
    res.json({ value: "Done", updated });
}


// export const add



