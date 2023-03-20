import joi from 'joi';

export const signUp = {
    body: joi.object().required().keys({
        email: joi.string().required().email(),
        name: joi.string().required(),
        password: joi.string().required().min(6),
        rePassword: joi.string().required().valid(joi.ref('password'))
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),

}
export const signIn = {
    body: joi.object().required().keys({
        email: joi.string().required().email(),
        password: joi.string().required(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}



export const NoDataSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}
