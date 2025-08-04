const AuthorizationError = require("../exceptions/AuthorizationError");
const adminServices = require("../services/admin");

const verifyMessageFromAdmin = async (message) => {
    const isGroup = message.key.remoteJid?.endsWith("@g.us");

    const senderJid = isGroup
        ? message.key.participant || message.key.remoteJid
        : message.key.remoteJid;

    const phoneNumber = senderJid.split("@")[0];

    const admin = await adminServices.find({ phoneNumber });
    if (!admin) {
        console.error(`Unauthorized access attempt by ${phoneNumber}`);

        throw new AuthorizationError(
            `Tidak dapat menjalankan command ini. Nomor anda tidak terdaftar sebagai admin.`
        );
    }

    return { admin };
};

module.exports = verifyMessageFromAdmin;
