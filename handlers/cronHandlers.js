const groupServices = require("../services/group");
const memberServices = require("../services/member");
const periodServices = require("../services/period");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");
const templateViews = require("../views/template");
const { handleShowList } = require("./listHandlers");

const handleNewPeriod = async (client) => {
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
            client.sendMessage(group.id, templateViews.doaKhatamQuran);
            client.sendMessage(group.id, templateViews.pembukaan);
            const list = await handleShowList({
                id: {
                    remote: group.id,
                },
            });
            client.sendMessage(group.id, list);
        });
    } catch (e) {
        console.error(e);
    }
};

const handleOneDayBeforeNewPeriod = async (client) => {
    try {
        const groups = await groupServices.getAll();
        groups.forEach((group) => {
            client.sendMessage(group.id, templateViews.oneDayReminder());
        });
    } catch (e) {
        console.error(e);
    }
};

module.exports = { handleNewPeriod, handleOneDayBeforeNewPeriod };
