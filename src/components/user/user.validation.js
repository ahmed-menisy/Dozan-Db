import joi from 'joi';

const addUserSchema = {
    body: joi.object().required().keys({
        email: joi.string().required().email()
    })
}

export {
    addUserSchema   
}