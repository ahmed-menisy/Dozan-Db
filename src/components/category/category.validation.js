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
    query: joi.object().required().keys({}),
}