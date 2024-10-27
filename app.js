require("dotenv").config();
const cron = require("node-cron");
const { Client, LocalAuth } = require("whatsapp-web.js");
const routesHandler = require("./routes/handler");
const qrcode = require("qrcode-terminal");
const { handleWeekly } = require("./handlers/cronHandlers");

const puppeteer = {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

const client = new Client({
    authStrategy: new LocalAuth(),
    ...(process.env.NODE_ENV === "production" ? { puppeteer } : {}),
});

client.once("ready", () => {
    console.log("Client is ready!");
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("message_create", async (message) => {
    if (process.env.NODE_ENV === "production") {
        await routesHandler.handler(message);
    } else {
        let result = "";
        message.reply = (text) => {
            result = text;
        };

        try {
            await routesHandler.handler(message);
        } catch (e) {
            result = e.message;
        }

        console.log(result);
    }
});

client.initialize();

const cronExpression = `0 ${process.env.PERIOD_START_HOUR} * * ${process.env.PERIOD_START_DAY}`;
cron.schedule(cronExpression, async () => {
    await handleWeekly(client);
});
