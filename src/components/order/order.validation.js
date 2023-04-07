import joi from 'joi';



export const createOrderVal = {
    body: joi.object().required().keys({
        phone: joi.string().required(),
        address: joi.string().required(),
        totalCost: joi.number().min(0).required(),
        comment: joi.string().max(2000)
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}

export const updateOrderVal = {
    body: joi.object().required().keys({
        phone: joi.string(),
        address: joi.string(),
        comment: joi.string().max(2000)
    }),
    params: joi.object().required().keys({
        _id: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({}),
}

export const deleteOrderVal = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        _id: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({}),
}


export const getOrderSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        status: joi.string().valid('all', 'delivered', 'not_delivered').required(),
        page: joi.number().min(1),
        size: joi.number().min(1).max(20).message('size must be a number between 1 and 20'),
    }),
}

export const getUserOrderSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        userId: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({
        status: joi.string().valid('all', 'delivered', 'not_delivered').required()
    }),
}

export const orderById = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        _id: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({}),
}

