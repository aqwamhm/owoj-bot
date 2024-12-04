const NotFoundError = require("../exceptions/NotFoundError");
const groupServices = require("../services/group");
const adminServices = require("../services/admin");
const validator = require("../utils/validator");
const errorMessages = require("../views/error");
const groupViews = require("../views/group");
const adminViews = require("../views/admin");

class GroupHandler {
    constructor(
        groupServices,
        adminServices,
        validator,
        errorMessages,
        groupViews,
        adminViews
    ) {
        this.groupServices = groupServices;
        this.adminServices = adminServices;
        this.validate = validator.validate;
        this.errorMessages = errorMessages;
        this.groupViews = groupViews;
        this.adminViews = adminViews;
    }

    async handleCreateGroup({ message, validation }) {
        const arg1 = message.body.split(" ")[1];

        this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "/register-group <nomor grup>",
                example: "/register-group 3",
            }),
        });

        await this.groupServices.create({
            id: message.id.remote,
            number: parseInt(arg1),
        });

        return this.groupViews.success.create({ number: arg1 });
    }

    async handleRemoveGroup({ message, validation }) {
        const arg1 = message.body.split(" ")[1];
        this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "/remove-group <nomor grup>",
                example: "/remove-group 3",
            }),
        });

        const group = await this.groupServices.find({ id: message.id.remote });

        if (group.number !== parseInt(arg1)) {
            throw new NotFoundError(this.groupViews.error.notFound(arg1));
        }

        await this.groupServices.remove({
            id: message.id.remote,
            number: parseInt(arg1),
        });

        return this.groupViews.success.remove({ number: arg1 });
    }

    async handleSetGroupAdmin({ message, validation, middlewareData }) {
        const { phone } = this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "/set-admin <nomor menggunakan kode negara (62)>",
                example: "/set-admin 621234567890",
            }),
        });

        const { group } = middlewareData;

        const admin = await this.adminServices.find({ phoneNumber: phone });
        if (!admin) {
            throw new NotFoundError(this.adminViews.error.notFound({ phone }));
        }

        await this.groupServices.update({
            adminPhoneNumber: phone,
            id: group.id,
        });

        return this.groupViews.success.setGroupAdmin({
            name: admin.name,
            number: group.number,
        });
    }
}

module.exports = new GroupHandler(
    groupServices,
    adminServices,
    validator,
    errorMessages,
    groupViews,
    adminViews
);
