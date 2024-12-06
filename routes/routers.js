const ClientError = require("../exceptions/ClientError");
const { commands, crons } = require("./index");

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

const cronRouter = async ({ message, cronHandler }) => {
    const cron = crons(cronHandler).find(
        (cron) => message.body === cron.prompt
    );

    if (cron) {
        try {
            if (cron.middlewares) {
                for (const middleware of cron.middlewares) {
                    await middleware(message);
                }
            }

            await cron.handler();

            message?.reply("Cron job ran successfully");
        } catch (e) {
            if (e instanceof ClientError) {
                message.reply(e.message);
                return;
            }

            message?.reply("Terjadi kesalahan");
            console.error(e);
        }
    }
};

module.exports = { commandRouter, cronRouter };
