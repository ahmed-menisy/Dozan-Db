import { nanoid } from "nanoid";
import productModel from "../../../DB/models/productModel.js";
import cloudinary from "../../utils/cloudinary.js";
import {
    StatusCodes
} from 'http-status-codes';
import ErrorClass from "../../utils/ErrorClass.js";
import { paginate } from "../../utils/pagination.js";



export const addProduct = async (req, res, next) => {
    const { title, price, description } = req.body

    const product = await productModel.findOne({ title })
    if (product) {
        return next(new ErrorClass("this title is already taken", StatusCodes.BAD_REQUEST))
    }
    let video, image, added, imagesDB = [];
    if (req.files) {
        let { mainImage, images, video } = req.files;
        if (mainImage) {
            image = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
                folder: `MainImages/${req.files.mainImage[0].originalname + nanoid()}`,
                public_id: req.files.mainImage[0].originalname + nanoid(),
                use_filename: true,
                unique_filename: false
            })
        }
        if (images) {
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
        added = await productModel.insertMany({ title, price, description, mainImage: image?.secure_url, video: video?.secure_url, images: imagesDB })
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
    let video, image, updatedProduct, imagesDB = product.images;
    // console.log("{ files: req.files }");
    if (req.files) {
        let { mainImage, images, video } = req.files;
        if (mainImage) {
            image = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
                folder: `MainImages/${req.files.mainImage[0].originalname + nanoid()}`,
                public_id: req.files.mainImage[0].originalname + nanoid(),
                use_filename: false,
                unique_filename: false
            })
            // await cloudinary.api.delete_folder('image/upload/v1678473644/MainImages/three.jpgBsQ3CQ_zMhHk9BPVZ3z8y').catch(err=>{
            //     console.log({err});
            // })
            // console.log({ image });
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
        updatedProduct = await productModel.updateOne({ _id }, { title, price, description, mainImage: image?.secure_url, video: video?.secure_url, images: imagesDB })
    } else {
        updatedProduct = await productModel.updateOne({ _id }, { title, price, description })
    }
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
    const {size ,page} = req.query
    const {skip,limit} = paginate(page,size)
    const products = await productModel.find().skip(skip).limit(limit)

    if (!products.length) {
        return next(new ErrorClass('No products available', StatusCodes.NOT_FOUND));
    }
    return res.status(StatusCodes.ACCEPTED).json({ result: products })
}



export const sort = async(req,res,next)=>{
    const {size ,page} = req.query
    const {skip,limit} = paginate(page,size)
    const products = await productModel.find().skip(skip).limit(limit).sort({ rate: -1, reviewNo: 1 })

    if (!products.length) {
        return next(new ErrorClass('No products available', StatusCodes.NOT_FOUND));
    }
    return res.status(StatusCodes.ACCEPTED).json({ result: products })

}

