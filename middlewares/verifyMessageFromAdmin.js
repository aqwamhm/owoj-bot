const AuthorizationError = require("../exceptions/AuthorizationError");
const adminServices = require("../services/admin");

const verifyMessageFromAdmin = async (message) => {
    const phoneNumber =
        message.key.participant?.split("@")[0] ||
        message.key.remoteJid?.split("@")[0];

    const admin = await adminServices.find({ phoneNumber });
    if (!admin) {
        throw new AuthorizationError(
            `Tidak dapat menjalankan command ini. Nomor anda tidak terdaftar sebagai admin.`
        );
    }

    return { admin };
};

module.exports = verifyMessageFromAdmin;
