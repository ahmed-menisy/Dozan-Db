import joi from 'joi';

export const createVal = {
    body: joi.object().required().keys({
        productId:joi.string().required().max(24).min(24),
        rate:joi.number().valid(0,1,2,3,4,5).required(),
        comment:joi.string().required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}




/*

export const NoDataSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}
*/