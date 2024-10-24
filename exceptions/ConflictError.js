const ClientError = require("./ClientError");

class ConflictError extends ClientError {
    constructor(message) {
        super(message);
        this.name = "ConflictError";
    }
}

module.exports = ConflictError;
