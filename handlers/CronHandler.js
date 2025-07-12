const groupServices = require("../services/group");
const memberServices = require("../services/member");
const periodServices = require("../services/period");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");
const templateViews = require("../views/template");
const ListHandler = require("./ListHandler");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CronHandler {
    constructor(client) {
        this.client = client;
    }

    async handleNewPeriod() {
        try {
            const { startDate, endDate } = getPeriodDate();

            const verifyPeriodExists = await periodServices.find({
                startDate,
                endDate,
            });

            if (!verifyPeriodExists) {
                await periodServices.create({
                    startDate,
                    endDate,
                });

                await memberServices.incrementAllCurrentJuz();

                const members = await memberServices.findAll();
                await reportServices.createMany({
                    members,
                    startDate,
                    endDate,
                });
            }

            const groups = await groupServices.getAll();

            if (Array.isArray(groups)) {
                for (const group of groups) {
                    try {
                        const list = await ListHandler.handleShowMemberList({
                            message: { key: { remoteJid: group.id } },
                            middlewareData: {
                                group: {
                                    number: group.number,
                                    admin: group.admin,
                                },
                            },
                        });

                        const combinedMessage = `${templateViews.doaKhatamQuran}\n\n------\n\n${templateViews.pembukaan}\n\n------\n\n${list}`;

                        await this._sendWithThrottle(group.id, combinedMessage);
                        console.log(`Message sent to ${group.id}`);
                    } catch (e) {
                        console.error(
                            `Failed to send messages to group ${group.id}:`,
                            e
                        );
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    async handleOneDayBeforeNewPeriod() {
        try {
            const groups = await groupServices.getAll();
            for (const group of groups) {
                try {
                    const uncompletedMemberList =
                        await ListHandler.handleShowUncompletedMemberList({
                            message: { key: { remoteJid: group.id } },
                        });
                    const message = `${templateViews.oneDayReminder()}\n\n${uncompletedMemberList}`;

                    await this._sendWithThrottle(group.id, message);
                } catch (e) {
                    console.error(e);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Internal helper: send with rate-limit handling and delay
     */
    async _sendWithThrottle(jid, text, attempt = 1) {
        try {
            await this.client.sendMessage(jid, { text });
            // wait 500 to 1000 ms between messages to avoid flooding
            await delay(Math.floor(Math.random() * (1000 - 500 + 1)) + 500);
        } catch (e) {
            const isRateLimit =
                e.data === 429 || (e.output && e.output.statusCode === 500);
            if (isRateLimit && attempt <= 3) {
                console.warn(
                    `Rate limit hit on ${jid}, retrying in 5s (attempt ${attempt})`
                );
                await delay(5000);
                return this._sendWithThrottle(jid, text, attempt + 1);
            }
            throw e;
        }
    }
}

module.exports = CronHandler;
