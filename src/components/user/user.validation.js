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


export const checkToken = {
    body: joi.object().required().keys({
        token:joi.string().required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}
export const NoDataSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}


export const SendCode = {
    body: joi.object().required().keys({
        email: joi.string().required().email(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}

export const reset = {
    body: joi.object().required().keys({
        email: joi.string().required().email(),
        code: joi.string().required().max(6).max(6),
        password: joi.string().min(6).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}