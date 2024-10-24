class ClientError extends Error {
    constructor(message = "Terjadi kesalahan") {
        super(message);
        this.name = "ClientError";
    }
}

module.exports = ClientError;
