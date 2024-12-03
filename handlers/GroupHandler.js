const NotFoundError = require("../exceptions/NotFoundError");
const groupServices = require("../services/group");
const validator = require("../utils/validator");
const errorMessages = require("../views/error");
const groupViews = require("../views/group");

class GroupHandler {
    constructor(groupServices, validator, errorMessages, groupViews) {
        this.groupServices = groupServices;
        this.validate = validator.validate;
        this.errorMessages = errorMessages;
        this.groupViews = groupViews;
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
}

module.exports = new GroupHandler(
    groupServices,
    validator,
    errorMessages,
    groupViews
);
