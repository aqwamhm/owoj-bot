const ClientError = require("./ClientError");

class ValidationError extends ClientError {
    constructor(message = "Command tidak valid!") {
        super(message);
        this.name = "ValidationError";
    }
}

module.exports = ValidationError;
