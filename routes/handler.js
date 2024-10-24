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
        if (route.middlewares) {
            for (const middleware of route.middlewares) {
                await middleware(msg);
            }
        }
        await route.handler(msg);
    }
};

module.exports = { handler };
