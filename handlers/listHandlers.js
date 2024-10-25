const periodServices = require("../services/period");
const memberServices = require("../services/member");
const { memberListWithReport } = require("../views/list");
const groupViews = require("../views/group");
const groupServices = require("../services/group");
const NotFoundError = require("../exceptions/NotFoundError");

const handleShowList = async (message) => {
    const group = await groupServices.find({ id: message.id.remote });

    if (!group) {
        throw new NotFoundError(groupViews.error.notFound());
    }

    const periods = await periodServices.getAll();
    const memberReportsData = await memberServices.getWithReports({
        groupId: message.id.remote,
    });

    return memberListWithReport({ members: memberReportsData, periods });
};

module.exports = { handleShowList };
