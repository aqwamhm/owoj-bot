const groupServices = require("../services/group");
const memberServices = require("../services/member");
const periodServices = require("../services/period");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");
const templateViews = require("../views/template");
const ListHandler = require("./ListHandler");

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
                await Promise.all(
                    groups.map(async (group) => {
                        try {
                            await this.client.sendMessage(group.id, {
                                text: templateViews.doaKhatamQuran,
                            });
                            await this.client.sendMessage(group.id, {
                                text: templateViews.pembukaan,
                            });

                            const list = await ListHandler.handleShowMemberList(
                                {
                                    message: { key: { remoteJid: group.id } },
                                    middlewareData: {
                                        group: {
                                            number: group.number,
                                            admin: group.admin,
                                        },
                                    },
                                }
                            );

                            await this.client.sendMessage(group.id, {
                                text: list,
                            });
                        } catch (e) {
                            console.error(
                                `Failed to send messages to group ${group.id}:`,
                                e
                            );
                        }
                    })
                );
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

                    this.client.sendMessage(group.id, { text: message });
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
