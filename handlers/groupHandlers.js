const groupServices = require("../services/group");

const { validate } = require("../validations/validators");
const errorMessages = require("../views/error");
const groupViews = require("../views/group");

const handleCreateGroup = async (message, validation) => {
    const arg1 = message.body.split(" ")[1];

    validate({
        command: message.body,
        validation,
        errorMessage: errorMessages.validation({
            format: "/register-group <nomor grup>",
            example: "/register-group 3",
        }),
    });

    await groupServices.create({
        id: message.id.remote,
        number: parseInt(arg1),
    });

    return groupViews.success.create({ nomor: arg1 });
};

module.exports = { handleCreateGroup };
