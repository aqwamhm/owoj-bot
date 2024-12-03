const ClientError = require("../exceptions/ClientError");
const { commands } = require(".");

const commandRouter = async (message) => {
    message.body = message.body.toLowerCase();
    const prompt = message.body.split(/[\s\u00A0]+/)[0];
    const command = commands().find((command) => command.prompt === prompt);

    if (command) {
        try {
            let middlewareData = {};

            if (command.middlewares) {
                for (const middleware of command.middlewares) {
                    const result = await middleware(message);
                    if (result) {
                        middlewareData = { ...middlewareData, ...result };
                    }
                }
            }

            const result = await command.handler({
                message,
                validation: command.validation || {},
                middlewareData,
            });

            if (result) {
                message.reply(result);
            }
        } catch (e) {
            if (e instanceof ClientError) {
                message.reply(e.message);
                return;
            }

            message.reply("Terjadi kesalahan");
            console.error(e);
        }
    }
};

module.exports = { commandRouter };
