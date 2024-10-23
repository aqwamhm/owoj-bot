const routes = require("./routes");

const handler = async (message) => {
    const prompt = message.body.split(" ")[0];
    const route = routes().find((route) => route.command === prompt);

    if (route) {
        await route.handler(message);
    }
};

module.exports = { handler };
