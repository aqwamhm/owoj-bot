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

const puppeteer = {
    headless: true,
    args: [
        "--disable-setuid-sandbox",
        "--disable-accelerated-2d-canvas",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-cache",
        "--disable-component-extensions-with-background-pages",
        "--disable-crash-reporter",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-gpu",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-mojo-local-storage",
        "--disable-notifications",
        "--disable-popup-blocking",
        "--disable-print-preview",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-software-rasterizer",
        "--ignore-certificate-errors",
        "--log-level=3",
        "--no-default-browser-check",
        "--no-first-run",
        "--no-sandbox",
        "--no-zygote",
        "--renderer-process-limit=100",
        "--enable-gpu-rasterization",
        "--enable-zero-copy",
    ],
};

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
(async () => {
    client = await startSock();
})();

const cronHandler = new CronHandler(client);

const routeCommand = async (message, client) => {
    if (process.env.NODE_ENV === "production") {
        await commandRouter(message, client);
        await cronRouter({ message, cronHandler }, client);
    } else {
        let result = "";
        message.reply = (text) => {
            result = text;
        };

        try {
            await commandRouter(message, client);
            await cronRouter({ message, cronHandler }, client);
        } catch (e) {
            result = e.message;
        }

        console.log(result);
    }
};

// client.initialize();

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
