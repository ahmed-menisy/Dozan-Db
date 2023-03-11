import {
    StatusCodes
} from 'http-status-codes';


const dateMethods = ['body', 'params', 'query']
const validation = (valSchema) => {
    return (req, res, next) => {
        const validationError = []
        dateMethods.forEach((method) => {
            if (valSchema[method]) {
                let validationRes = valSchema[method].validate(req[method], { abortEarly: false })
                if (validationRes.error) {
                    validationError.push(validationRes.error.details)
                }
            }

        })
        if (!validationError.length) {
            next()
        } else {
            const messages = []
            validationError.forEach(error => {
                error.map(err => {
                    messages.push(err.message)

                })
            });
            res.status(StatusCodes.BAD_REQUEST).json({ message: "validationError", Error: messages })
        }
    }
}
export default validation