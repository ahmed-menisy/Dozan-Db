import joi from "joi";

export const addProductSchema = {
    body: joi.object().required().keys({
        title: joi.string().required(),
        price: joi.number().required(),
        description: joi.string().required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),

}


export const updateProductSchema = {
    body: joi.object().required().keys({
        title: joi.string().required(),
        price: joi.number().required(),
        description: joi.string().required()
    }),
    params: joi.object().required().keys({
        _id: joi.string().required().max(24).min(24)
    }),
    query: joi.object().required().keys({}),

}

export const deleteProductSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        _id: joi.string().required().max(24).min(24)
    }),
    query: joi.object().required().keys({}),
}
export const NoDataSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}