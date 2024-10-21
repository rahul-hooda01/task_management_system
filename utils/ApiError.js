class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", type = "GeneralError") {
        super(message);  // Pass the message to the parent Error class
        this.statusCode = statusCode;
        this.type = type;
        this.success = false;
    }

    // Convert the error to a JSON-friendly format
    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            type: this.type,
        };
    }
}

export { ApiError };