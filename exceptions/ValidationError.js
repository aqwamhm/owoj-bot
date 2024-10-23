class ValidationError extends Error {
    constructor(message = "Command tidak valid!") {
        super(message);
        this.name = "ValidationError";
    }
}

module.exports = ValidationError;
