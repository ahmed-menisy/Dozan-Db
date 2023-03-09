class ErrorClass extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
        this.error="error"
    }
}
export default ErrorClass