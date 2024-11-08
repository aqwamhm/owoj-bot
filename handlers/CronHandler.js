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
                const list = await ListHandler.handleShowList({
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
            groups.forEach((group) => {
                this.client.sendMessage(
                    group.id,
                    templateViews.oneDayReminder()
                );
            });
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = CronHandler;
