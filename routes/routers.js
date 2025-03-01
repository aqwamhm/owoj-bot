const ClientError = require("../exceptions/ClientError");
const { commands, crons } = require("./index");

const commandRouter = async (message, client) => {
    let result = undefined;
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    if (currentTimeStamp - message.messageTimestamp > 5) {
        return result;
    }

    const messageBody =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";
    const prompt = messageBody.toLowerCase().split(/[\s\u00A0]+/)[0];
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

            result = await command.handler({
                message: { ...message, body: messageBody },
                validation: command.validation || {},
                middlewareData: middlewareData,
            });

            if (result) {
                client.sendMessage(
                    message.key.remoteJid,
                    { text: result },
                    { quoted: message }
                );
            }
        } catch (e) {
            if (e instanceof ClientError) {
                result = e.message;

                client.sendMessage(
                    message.key.remoteJid,
                    { text: result },
                    { quoted: message }
                );
            } else {
                result = "Terjadi kesalahan";

                client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: result,
                    },
                    { quoted: message }
                );
                console.error(e);
            }
        }
    }
};

const cronRouter = async ({ message, cronHandler }, client) => {
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    if (currentTimeStamp - message.messageTimestamp > 5) {
        return;
    }

    const messageBody =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";
    const cron = crons(cronHandler).find((cron) => messageBody === cron.prompt);

    if (cron) {
        try {
            if (cron.middlewares) {
                for (const middleware of cron.middlewares) {
                    await middleware(message);
                }
            }

            await cron.handler();

            client.sendMessage(
                message.key.remoteJid,
                {
                    text: "Cron job ran successfully",
                },
                { quoted: message }
            );
        } catch (e) {
            if (e instanceof ClientError) {
                client.sendMessage(
                    message.key.remoteJid,
                    { text: e.message },
                    { quoted: message }
                );

                return;
            }

            client.sendMessage(
                message.key.remoteJid,
                {
                    text: "Terjadi kesalahan",
                },
                { quoted: message }
            );

            console.error(e);
        }
    }
};

module.exports = { commandRouter, cronRouter };
