const routes = require("./routes");

const handler = async (message) => {
    const prompt = message.body.split(" ")[0];
    const route = routes().find((route) => route.command === prompt);

    if (route) {
        if (route.middlewares) {
            for (const middleware of route.middlewares) {
                await middleware(message);
            }
        }
        await route.handler(message);
    }
};

module.exports = { handler };
