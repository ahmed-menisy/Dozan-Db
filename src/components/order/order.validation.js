import joi from 'joi';



export const createOrderVal = {
    body: joi.object().required().keys({
        phone: joi.string().required(),
        address: joi.string().required(),
        products: joi.array()
            .items({
                product: joi.string().max(24).min(24).required(),
                quantity: joi.number().min(1).required()
            })
            .required(),
        comment: joi.string().max(2000),
        payMethod: joi.string().valid('Visa', 'Paypal', "Cash")
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}

export const updateOrderVal = {
    body: joi.object().required().keys({
        phone: joi.string(),
        address: joi.string(),
        products: joi.array()
            .items({
                product: joi.string().max(24).min(24).required(),
                quantity: joi.number().min(1).required()
            })
            .required(),
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


export const checkOut = {
    body: joi.object().required().keys({
        shippingMount: joi.number().min(0).required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}
