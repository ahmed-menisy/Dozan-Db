import joi from 'joi';



export const addToCart = {
    body: joi.object().required().keys({
        productDetails: joi.object({
            product: joi.string().max(24).min(24).required(),
            quantity: joi.number().min(1).required()
        }).required(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}

export const updateCartVal = {
    body: joi.object().required().keys({
        quantity:joi.number().min(1).required()
    }),
    params: joi.object().required().keys({
        _id: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({}),
}

export const deleteCartVal = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        productId: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({}),
}


export const getOrderSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        status: joi.string().valid('all', 'delivered', 'not_delivered').required()
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


export const noDateSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}


