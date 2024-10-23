require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const routesHandler = require("./routes/handler");
const qrcode = require("qrcode-terminal");
const ValidationError = require("./exceptions/ValidationError");
const ConflictError = require("./exceptions/ConflictError");

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.once("ready", () => {
    console.log("Client is ready!");
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("message_create", async (message) => {
    try {
        await routesHandler.handler(message);
    } catch (e) {
        if (e instanceof ValidationError || e instanceof ConflictError) {
            message.reply(e.message);
            return;
        }

        message.reply("Terjadi kesalahan");
        console.error(e);
    }
});

client.initialize();
