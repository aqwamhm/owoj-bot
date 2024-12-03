const adminServices = require("../services/admin");
const validator = require("../utils/validator");
const errorMessages = require("../views/error");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthenticationError = require("../exceptions/AuthenticationError");
const ConflictError = require("../exceptions/ConflictError");
const adminViews = require("../views/admin");

class AdminHandler {
    constructor(adminServices, validator, errorMessages, adminViews) {
        this.adminServices = adminServices;
        this.validate = validator.validate;
        this.errorMessages = errorMessages;
        this.adminViews = adminViews;
    }

    async handleRegisterAdmin({ message, validation }) {
        const { name, phone, password } = this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "/register-admin <nama>#<nomor menggunakan kode negara (62)> <password>",
                example:
                    "/register-admin Aqwam#6281234567 password-dari-grup-admin",
            }),
        });

        if (password !== process.env.ADMIN_PASSWORD) {
            throw new AuthenticationError(
                this.adminViews.error.authentication()
            );
        }

        const admin = await this.adminServices.find({ phoneNumber: phone });
        if (admin) {
            throw new ConflictError(this.adminViews.error.conflict({ phone }));
        }

        await this.adminServices.create({ phoneNumber: phone, name });
        return this.adminViews.success.create({ name, phone });
    }

    async handleRemoveAdmin({ message, validation }) {
        const { phone } = this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "/remove-admin <nomor menggunakan kode negara (62)>",
                example: "/remove-admin 6212345678",
            }),
        });

        const admin = await this.adminServices.find({ phoneNumber: phone });
        if (!admin) {
            throw new NotFoundError(this.adminViews.error.notFound({ phone }));
        }

        await this.adminServices.remove({ phoneNumber: phone });
        return this.adminViews.success.remove({ name: admin.name, phone });
    }
}

module.exports = new AdminHandler(
    adminServices,
    validator,
    errorMessages,
    adminViews
);
