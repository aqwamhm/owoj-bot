require("dotenv").config();
const cron = require("node-cron");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { commandRouter } = require("./routes/routers");
const qrcode = require("qrcode-terminal");
const CronHandler = require("./handlers/CronHandler");

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
        await commandRouter(message);
    } else {
        let result = "";
        message.reply = (text) => {
            result = text;
        };

        try {
            await commandRouter(message);
        } catch (e) {
            result = e.message;
        }

        console.log(result);
    }
});

client.initialize();

const cronHandler = new CronHandler(client);

const newPeriod = `0 ${process.env.PERIOD_START_HOUR} * * ${process.env.PERIOD_START_DAY}`;
cron.schedule(newPeriod, async () => {
    await cronHandler.handleNewPeriod();
});

const oneDayBeforeNewPeriod = `0 ${process.env.PERIOD_START_HOUR} * * ${
    process.env.PERIOD_START_DAY - 1
}`;
cron.schedule(oneDayBeforeNewPeriod, async () => {
    await cronHandler.handleOneDayBeforeNewPeriod();
});
