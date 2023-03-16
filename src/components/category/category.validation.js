import joi from 'joi';

export const createVal = {
    body: joi.object().required().keys({
        name: joi.string().required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}

export const update = {
    body: joi.object().required().keys({
        name: joi.string().required()
    }),
    params: joi.object().required().keys({
        categoryId: joi.string().required().max(24).min(24),
    }),
    query: joi.object().required().keys({}),
}


export const NoDataSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}


export const getCategoryById = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        categoryId: joi.string().required().max(24).min(24),
    }),
    query: joi.object().required().keys({
        sort: joi.string().required().valid('sorted','notSorted'),
        page: joi.number().min(1),
        size: joi.number().min(1).max(20).message('size must be a number between 1 and 20'),
    }),
}

export const getAllCategories = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        page: joi.number().min(1),
        sort: joi.string().required().valid('sorted','not_sorted'),
        size: joi.number().min(1).max(20).message('size must be a number between 1 and 20'),
    }),
}