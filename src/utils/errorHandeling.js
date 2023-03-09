import ErrorClass from "./ErrorClass.js";

export const errorHandel = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    if (err.message.includes("E11000")) {
        return res.status(err.statusCode).json({
            status: 400,
            msg: "email Already Exist",
        });
    }
    res.status(err.statusCode).json({
        status: err.statusCode,
        ErrorMessage: err.message,
    });
    console.log(err);

};



export const asyncErrorHandler = (endPoint) => {
    return (req, res, next) => {
        endPoint(req, res, next).catch((err) => {
            next(new ErrorClass(err, 500));
        });
    };
};
