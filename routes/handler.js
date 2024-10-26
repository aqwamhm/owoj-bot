const ClientError = require("../exceptions/ClientError");
const routes = require("./routes");

const handler = async (message) => {
    message.body = message.body.toLowerCase();
    const prompt = message.body.split(" ")[0];
    const route = routes().find((route) => route.command === prompt);

    if (route) {
        try {
            if (route.middlewares) {
                for (const middleware of route.middlewares) {
                    await middleware(message);
                }
            }
            const result = await route.handler(message);

            message.reply(result);
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

module.exports = { handler };
