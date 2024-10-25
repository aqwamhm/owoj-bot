const groupServices = require("../services/group");
const memberServices = require("../services/member");
const periodServices = require("../services/period");
const { getPeriodDate } = require("../utils/hepler");
const templateViews = require("../views/template");
const { handleShowList } = require("./listHandlers");

const handleWeekly = async (client) => {
    try {
        const { startDate, endDate } = getPeriodDate();
        await periodServices.create({
            startDate,
            endDate,
        });
        await memberServices.incrementAllCurrentJuz();
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

module.exports = { handleWeekly };
