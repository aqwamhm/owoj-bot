require("dotenv").config();
const cron = require("node-cron");
const { commandRouter, cronRouter } = require("./routes/routers");
const qrcode = require("qrcode-terminal");
const CronHandler = require("./handlers/CronHandler");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} = require("baileys");
const { Boom } = require("@hapi/boom");

const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(
        "auth_info_baileys"
    );

    const client = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["Chrome (Linux)", "", ""],
    });

    client.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect.error instanceof Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut;
            console.log(
                "connection closed due to ",
                lastDisconnect.error,
                ", reconnecting ",
                shouldReconnect
            );
            if (shouldReconnect) {
                startSock();
            }
        } else if (connection === "open") {
            console.log("opened connection");
        }
    });

    client.ev.on("creds.update", saveCreds);

    client.ev.on("messages.upsert", async (m) => {
        const messages = m.messages;
        for (const message of messages) {
            await routeCommand(message, client);
        }
    });

    return client;
};

let client;
let cronHandler;

(async () => {
    client = await startSock();
    cronHandler = new CronHandler(client);
})();

const routeCommand = async (message, client) => {
    try {
        if (process.env.NODE_ENV === "production") {
            await commandRouter(message, client);
            await cronRouter({ message, cronHandler }, client);
        } else {
            let result = "";
            client.sendMessage = async (_, message, _2) => {
                result = message.text;
            };
            const cronHandler = new CronHandler(client);
            await commandRouter(message, client);
            await cronRouter({ message, cronHandler }, client);
            console.log("Result:", result);
        }
    } catch (e) {
        result = e.message;
        console.error("Error:", result);
    }
};

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
