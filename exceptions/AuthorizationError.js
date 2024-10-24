const ClientError = require("./ClientError");

class AuthorizationError extends ClientError {
    constructor(message = "Anda tidak memiliki akses ke command ini.") {
        super(message);
        this.name = "AuthorizationError";
    }
}

module.exports = AuthorizationError;
