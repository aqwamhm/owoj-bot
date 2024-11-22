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

            const groups = await groupServices.getAll();
            groups.forEach(async (group) => {
                this.client.sendMessage(group.id, templateViews.doaKhatamQuran);
                this.client.sendMessage(group.id, templateViews.pembukaan);
                const list = await ListHandler.handleShowMemberList({
                    id: {
                        remote: group.id,
                    },
                });
                this.client.sendMessage(group.id, list);
            });
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
                            id: { remote: group.id },
                        });
                    const message = `${templateViews.oneDayReminder()}\n\n${uncompletedMemberList}`;

                    this.client.sendMessage(group.id, message);
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
