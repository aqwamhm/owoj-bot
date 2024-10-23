const memberServices = require("../services/member");
const validations = require("../validations");
const { validate } = require("../validations/validators");
const errorMessages = require("../views/error");

const handleSetMember = async (message) => {
    const args = message.body.split(" ").slice(1);
    const responses = [];
    const setPromises = [];

    validate({
        command: message.body,
        validation: validations.setCommand.regex,
        errorMessage: errorMessages.validation({
            format: "#set <juz#nama> <juz#nama> <juz#nama> ...",
            example: "#set 12#Aqwam 13#Ivo 14#Aqbil ...",
        }),
    });

    for (const arg of args) {
        const [currentJuz, name] = arg.split("#");

        if (currentJuz && name) {
            const setPromise = memberServices
                .set({
                    name,
                    currentJuz: parseInt(currentJuz),
                    groupId: message.id.remote,
                })
                .then(() => `${name} di set ke Juz ${currentJuz}`)
                .catch((e) => {
                    console.log(e);

                    return `${name} gagal mengatur juz`;
                });

            setPromises.push(setPromise);
        } else {
            responses.push(`Format salah untuk: ${arg}`);
        }
    }

    const results = await Promise.all(setPromises);

    message.reply([...responses, ...results].join("\n"));
};

module.exports = { handleSetMember };
