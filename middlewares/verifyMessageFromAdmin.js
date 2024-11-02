const AuthorizationError = require("../exceptions/AuthorizationError");
const adminServices = require("../services/admin");

const verifyMessageFromAdmin = async (message) => {
    const contact = await message.getContact();
    const { number: phoneNumber } = contact;

    const admin = await adminServices.find({ phoneNumber });
    if (!admin) {
        throw new AuthorizationError(
            `Tidak dapat menjalankan command ini. Nomor anda tidak terdaftar sebagai admin.`
        );
    }
};

module.exports = verifyMessageFromAdmin;
