const periodServices = require("../services/period");
const memberServices = require("../services/member");
const { memberListWithReport } = require("../views/list");

class ListHandler {
    constructor(periodServices, memberServices, memberListWithReport) {
        this.periodServices = periodServices;
        this.memberServices = memberServices;
        this.memberListWithReport = memberListWithReport;
    }

    async handleShowList(message) {
        const periods = await this.periodServices.getAll();
        const memberReportsData = await this.memberServices.getWithReports({
            groupId: message.id.remote,
        });

        return this.memberListWithReport({
            members: memberReportsData,
            periods,
        });
    }
}

module.exports = new ListHandler(
    periodServices,
    memberServices,
    memberListWithReport
);
