const adminServices = require("../services/admin");
const { validate } = require("../utils/validator");
const errorMessages = require("../views/error");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthenticationError = require("../exceptions/AuthenticationError");
const ConflictError = require("../exceptions/ConflictError");
const adminViews = require("../views/admin");

const handleRegisterAdmin = async (message, validation) => {
    const { name, phone, password } = validate({
        command: message.body,
        validation,
        errorMessage: errorMessages.validation({
            format: "/register-admin <nama>#<nomor menggunakan kode negara (62)> <password>",
            example:
                "/register-admin Aqwam#6281234567 password-dari-grup-admin",
        }),
    });

    if (password !== process.env.ADMIN_PASSWORD) {
        throw new AuthenticationError(adminViews.error.authentication());
    }

    const admin = await adminServices.find({ phoneNumber: phone });
    if (admin) {
        throw new ConflictError(adminViews.error.conflict({ phone }));
    }

    await adminServices.create({ phoneNumber: phone, name });

    return adminViews.success.create({ name, phone });
};

const handleRemoveAdmin = async (message, validation) => {
    const { phone } = validate({
        command: message.body,
        validation,
        errorMessage: errorMessages.validation({
            format: "/remove-admin <nomor menggunakan kode negara (62)>",
            example: "/remove-admin 6212345678",
        }),
    });

    const admin = await adminServices.find({ phoneNumber: phone });
    if (!admin) {
        throw new NotFoundError(adminViews.error.notFound({ phone }));
    }

    await adminServices.remove({ phoneNumber: phone });
    return adminViews.success.remove({ name: admin.name, phone });
};

module.exports = { handleRegisterAdmin, handleRemoveAdmin };
