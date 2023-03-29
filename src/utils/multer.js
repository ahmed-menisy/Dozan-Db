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
        // console.log(file);
        if (!file.originalname.match(allowedFiles)) {
            cb(new ErrorClass('NOT ALLOWED FILES'), false)
        } else {
            cb(null, true)
        }
    }

    const uploads = multer({
        limits: {
            fileSize: 10*1024*1024 // 10MB
        }, fileFilter, storage
    })
    return uploads
}