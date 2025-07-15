require("dotenv").config();
const cron = require("node-cron");
const QRCode = require("qrcode");
const { commandRouter, cronRouter } = require("./routes/routers");
const CronHandler = require("./handlers/CronHandler");
const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} = require("baileys");
const { Boom } = require("@hapi/boom");
const NodeCache = require("node-cache");

// Validate required environment variables
const requiredEnvVars = ["PERIOD_START_HOUR", "PERIOD_START_DAY"];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar])
        throw new Error(`Missing required environment variable: ${envVar}`);
});

// Cache groups for metadata
const groupCache = new NodeCache({ stdTTL: 86400, useClones: false }); // 24h TTL

let client = null;
let cronHandler = null;
let presenceIntervalStarted = false;
let jobsScheduled = false;

/**
 * Create and configure a new WhatsApp socket client
 */
const createClient = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(
        "auth_info_baileys"
    );

    const socketConfig = {
        auth: state,
        browser: ["Chrome (Linux)", "", ""],
        markOnlineOnConnect: true,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        keepAliveIntervalMs: 30_000, // ping server every 30s to avoid idle disconnect
        getCachedGroupMetadata: async (jid) => {
            try {
                if (!groupCache.has(jid)) {
                    const metadata = await client.groupMetadata(jid);
                    groupCache.set(jid, metadata);
                }
                return groupCache.get(jid);
            } catch (error) {
                console.error(
                    `Failed to cache group metadata for ${jid}: ${error.message}`
                );
                return null;
            }
        },
    };

    const sock = makeWASocket(socketConfig);
    sock.ev.on("creds.update", saveCreds);

    // Handle connection updates, including manual QR display
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate and display QR code manually in terminal
            console.log(
                await QRCode.toString(qr, { type: "terminal", small: true })
            );
        }

        if (connection === "close") {
            const statusCode =
                lastDisconnect?.error instanceof Boom
                    ? lastDisconnect.error.output.statusCode
                    : DisconnectReason.connectionClosed;

            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.warn(
                `Connection closed (Reason: ${
                    DisconnectReason[statusCode] || statusCode
                }), ${shouldReconnect ? "reconnecting..." : "stopping"}`
            );
            if (shouldReconnect) setTimeout(initializeClient, 5000);
        }

        if (connection === "open") {
            console.info("Successfully connected to WhatsApp");

            // start periodic presence updates once
            if (!presenceIntervalStarted) {
                presenceIntervalStarted = true;
                setInterval(() => {
                    if (client?.sendPresenceUpdate) {
                        client.sendPresenceUpdate("available");
                    }
                }, 60_000);
            }
        }
    });

    return sock;
};

/**
 * Initialize client, event handlers, cron jobs
 */
const initializeClient = async () => {
    try {
        client = await createClient();
        cronHandler = new CronHandler(client);

        setupEventHandlers(client);
        scheduleCronJobs();
        console.info("WhatsApp client initialized successfully");
    } catch (error) {
        console.error(`Initialization failed: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Wire up all Baileys event listeners
 */
const setupEventHandlers = (sock) => {
    sock.ev.on("messages.upsert", handleMessagesUpsert);
    sock.ev.on("groups.update", handleGroupsUpdate);
    sock.ev.on("group-participants.update", handleGroupParticipantsUpdate);
};

/**
 * Handle connect / disconnect updates
 */
const handleConnectionUpdate = (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
        console.info("Successfully connected to WhatsApp");

        // start periodic presence updates once
        if (!presenceIntervalStarted) {
            presenceIntervalStarted = true;
            setInterval(() => {
                if (client?.sendPresenceUpdate) {
                    client.sendPresenceUpdate("available");
                }
            }, 60_000);
        }
    } else if (connection === "close") {
        const statusCode =
            lastDisconnect.error instanceof Boom
                ? lastDisconnect.error.output.statusCode
                : DisconnectReason.connectionClosed;

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.warn(
            `Connection closed (Reason: ${
                DisconnectReason[statusCode] || statusCode
            }), ${shouldReconnect ? "reconnecting..." : "stopping"}`
        );
        if (shouldReconnect) setTimeout(initializeClient, 5000);
    }
};

/**
 * Dispatch incoming messages
 */
const handleMessagesUpsert = async ({ messages }) => {
    try {
        await Promise.all(messages.map((msg) => routeCommand(msg, client)));
    } catch (error) {
        console.error(`Message processing error: ${error.message}`);
    }
};

/**
 * Keep group metadata in cache
 */
const handleGroupsUpdate = async (updates) => {
    await Promise.all(
        updates.map(async (upd) => {
            try {
                const meta = await client.groupMetadata(upd.id);
                groupCache.set(upd.id, meta);
            } catch (err) {
                console.error(`Group update error: ${err.message}`);
            }
        })
    );
};

/**
 * Keep participant metadata in cache
 */
const handleGroupParticipantsUpdate = async (upd) => {
    try {
        const meta = await client.groupMetadata(upd.id);
        groupCache.set(upd.id, meta);
    } catch (err) {
        console.error(`Participant update error: ${err.message}`);
    }
};

/**
 * Route commands & cron triggers
 */
const routeCommand = async (message, sock) => {
    try {
        if (process.env.NODE_ENV === "production") {
            await commandRouter(message, sock);
            await cronRouter({ message, cronHandler }, sock);
        } else {
            const testResponse = await commandRouter(message, {
                sendMessage: async (jid, content) => {
                    console.debug(
                        `[DEV] Would send to ${jid}: ${content.text}`
                    );
                },
            });
            console.debug("[DEV] Command execution result:", testResponse);
        }
    } catch (err) {
        console.error(`Command error: ${err.message}`);
        if (process.env.NODE_ENV === "production") {
            await sock.sendMessage(message.key.remoteJid, {
                text: `Error: ${err.message}`,
            });
        }
    }
};

/**
 * Schedule cron jobs for new period & reminder
 */
const scheduleCronJobs = () => {
    if (jobsScheduled) return; // prevent double-scheduling
    jobsScheduled = true;

    const hour = parseInt(process.env.PERIOD_START_HOUR, 10);
    const day = parseInt(process.env.PERIOD_START_DAY, 10);
    const previousDay = (day - 1 + 7) % 7;

    cron.schedule(`0 ${hour} * * ${day}`, async () => {
        console.info("Starting new period routine");
        await cronHandler.handleNewPeriod();
    });

    cron.schedule(`0 ${hour} * * ${previousDay}`, async () => {
        console.info("Starting reminder routine");
        await cronHandler.handleOneDayBeforeNewPeriod();
    });
};

// crash on unhandled errors (so external proc manager restarts us)
process.on("uncaughtException", (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});

// kickoff
initializeClient();
