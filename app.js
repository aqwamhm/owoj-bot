require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const routesHandler = require("./routes/handler");
const qrcode = require("qrcode-terminal");

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
    await routesHandler.handler(message);
});

client.initialize();
