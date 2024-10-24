const adminServices = require("../services/admin");
const { validate } = require("../validations/validators");
const validations = require("../validations");
const errorMessages = require("../views/error");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthenticationError = require("../exceptions/AuthenticationError");

const handleRegisterAdmin = async (message) => {
    const { name, phone, password } = validate({
        command: message.body,
        validation: validations.registerAdminCommand,
        errorMessage: errorMessages.validation({
            format: "/register-admin <nama>#<nomor menggunakan kode negara (62)> <password>",
            example:
                "/register-admin Aqwam#6281234567 password-dari-grup-admin",
        }),
    });

    if (password !== process.env.ADMIN_PASSWORD) {
        throw new AuthenticationError(
            `Gagal mendaftarkan admin. Password yang anda berikan salah.`
        );
    }

    const admin = await adminServices.find({ phoneNumber: phone });
    if (admin) {
        throw new NotFoundError(
            `Gagal mendaftarkan admin. Nomor telepon ${phone} sudah terdaftar sebagai admin.`
        );
    }

    await adminServices.create({ phoneNumber: phone, name });
    message.reply(`${name} berhasil didaftarkan sebagai admin.`);
};

module.exports = { handleRegisterAdmin };
