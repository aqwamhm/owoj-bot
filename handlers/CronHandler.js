const groupServices = require("../services/group");
const memberServices = require("../services/member");
const periodServices = require("../services/period");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");
const templateViews = require("../views/template");
const ListHandler = require("./ListHandler");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const randomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

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

                        await this.client.sendMessage(group.id, {
                            text: combinedMessage,
                        });
                        await delay(randomDelay(100, 1500));
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

                    await this.client.sendMessage(group.id, { text: message });
                    await delay(randomDelay(100, 1500));
                } catch (e) {
                    console.error(e);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = CronHandler;
