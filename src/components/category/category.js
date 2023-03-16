import ErrorClass from "../../utils/ErrorClass.js";
import {
    StatusCodes
} from 'http-status-codes';
import categoryModel from "../../../DB/models/categoryModel.js";
import { paginate } from "../../utils/pagination.js";


export const createCategory = async (req, res, next) => {
    let { name } = req.body;
    name = name.toLowerCase()
    const category = await categoryModel.findOne({ name })
    if (category) {
        return next(new ErrorClass("This category already exist", StatusCodes.BAD_REQUEST))
    }
    let add = new categoryModel({ name })
    add = await add.save()
    res.status(StatusCodes.CREATED).json({ message: "Done", result: add });
}

export const update = async (req, res, next) => {
    let { name } = req.body;
    const { categoryId } = req.params
    const category = await categoryModel.findById(categoryId)
    if (!category) {
        return next(new ErrorClass("category not found", StatusCodes.NOT_FOUND))
    }
    name = name.toLowerCase()
    const isNameExist = await categoryModel.findOne({
        name,
        _id: {
            $ne: categoryId
        }
    })
    if (isNameExist) {
        return next(new ErrorClass("This category name already exist", StatusCodes.BAD_REQUEST))
    }
    category.name = name
    await category.save()
    res.status(StatusCodes.CREATED).json({ message: "Done", result: category });
}

export const getAllCategories = async (req, res, next) => {
    let { page, size, sort } = req.query;
    const { skip, limit } = paginate(page, size)

    const arrayStatus = { // sorted or not
        not_sorted: {
            skip,
            limit,
        },
        sorted: {
            skip,
            limit,
            sort: { rate:-1, reviewNo:-1 }
        }
    }

    const categories = await categoryModel.find({}).populate({
        path: 'products',
        options: arrayStatus[sort],
    })
    res.json({
        message: "Done", result: categories
    })
}

export const getCategoryById = async (req, res, next) => {
    const { categoryId } = req.params
    let { page, size, sort } = req.query;
    const { skip, limit } = paginate(page, size)
    const arrayStatus = { // sorted or not
        not_sorted: {
            skip,
            limit,
        },
        sorted: {
            skip,
            limit,
            sort: { rate:-1, reviewNo:-1 }
        }
    }


    const categories = await categoryModel.findById(categoryId).populate([{
        path: "products",
        options: {
            skip,
            limit,
            options: arrayStatus[sort],


        },
    }])
    res.json({ message: "Done", result: categories })
}