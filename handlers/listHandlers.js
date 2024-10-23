const periodServices = require("../services/period");
const memberServices = require("../services/member");
const { memberListWithReport } = require("../views/list");

const handleShowList = async (message) => {
    const periods = await periodServices.getAll();

    const memberReportsData = await memberServices.getWithReports({
        groupId: message.id.remote,
    });

    message.reply(
        memberListWithReport({ members: memberReportsData, periods })
    );
};

module.exports = { handleShowList };
