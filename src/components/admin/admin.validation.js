import joi from 'joi';

export const addAdminSchema = {
    body: joi.object().required().keys({
        name: joi.string().required(),
        email: joi.string().required().email(),
        password: joi.string().required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),

}

export const signinSchema = {
    body: joi.object().required().keys({
        email: joi.string().required().email(),
        password: joi.string().required(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),

}
export const changePassSchema = {
    body: joi.object().required().keys({
        oldPass: joi.string().required(),
        newPass: joi.string().required(),
        confirmPassword: joi.string().valid(joi.ref('newPass')).required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),

}


export const update = {
    body: joi.object().required().keys({
        name:joi.string().required(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}

export const deleteAdmin = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        id: joi.string().required().min(24).max(24),
    }),
    query: joi.object().required().keys({}),
}