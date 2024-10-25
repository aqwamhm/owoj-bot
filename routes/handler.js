const ClientError = require("../exceptions/ClientError");
const routes = require("./routes");

const handler = async (message) => {
    const prompt = message.body.split(" ")[0];
    const route = routes().find((route) => route.command === prompt);

    const msg = {
        body: message.body,
        from: message.from,
        id: message.id,
    };

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
                console.log(e.message);
                return;
            }

            message.reply("Terjadi kesalahan");
            console.error(e);
        }
    }
};

module.exports = { handler };
