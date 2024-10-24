const AuthorizationError = require("../exceptions/AuthorizationError");
const adminServices = require("../services/admin");

const verifyMessageFromAdmin = async (message) => {
    const phoneNumber = message.from.split("@")[0];
    const admin = await adminServices.find({ phoneNumber });
    if (!admin) {
        throw new AuthorizationError(
            `Tidak dapat menjalankan command ini. Nomor anda tidak terdaftar sebagai admin.`
        );
    }
};

module.exports = verifyMessageFromAdmin;
