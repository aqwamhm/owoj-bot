const groupServices = require("../services/group");
const validations = require("../validations");
const { validate } = require("../validations/validators");
const errorMessages = require("../views/error");

const handleCreateGroup = async (message) => {
    const arg1 = message.body.split(" ")[1];

    validate({
        command: message.body,
        validation: validations.createGroupCommand.regex,
        errorMessage: errorMessages.validation({
            format: "#create <nomor grup>",
            example: "#create 3",
        }),
    });

    await groupServices.create({
        id: message.id.remote,
        number: parseInt(arg1),
    });

    message.reply("Group berhasil ditambahkan!");
};

module.exports = { handleCreateGroup };
