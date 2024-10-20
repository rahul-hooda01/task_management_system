
class ApiError {
    constructor(statusCode, message = "something went wrong"){
        this.statusCode = statusCode
        this.message = message
        this.success = false;
    }
}

export {ApiError};