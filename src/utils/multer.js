import multer from "multer";
import ErrorClass from "./ErrorClass.js";
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url'
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const filesValidation = {
    image: /\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP|jfif)$/,
    video: /\.(mp4|avi|flv|wmv|mov|mpeg|3gp|jfif)$/,
    all: /\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP|mp4|avi|flv|wmv|mov|mpeg|3gp|jfif)$/
}
Object.freeze(filesValidation)

export const myMulter = (allowedFiles = filesValidation.image) => {

    const storage = multer.diskStorage({})
    const fileFilter = (req, file, cb) => {
        // console.log(req.body);
        if (file.originalname.match(allowedFiles)) {
            console.log({ file });
            cb(null, true)
        } else {
            cb(new ErrorClass('NOT ALLOWED FILES'), false)
        }
    }

    const uploads = multer({ fileFilter, storage })
    return uploads
}