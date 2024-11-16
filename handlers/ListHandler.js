const periodServices = require("../services/period");
const memberServices = require("../services/member");
const adminServices = require("../services/admin");
const listView = require("../views/list");

class ListHandler {
    constructor(periodServices, memberServices, listView) {
        this.periodServices = periodServices;
        this.memberServices = memberServices;
        this.adminServices = adminServices;
        this.listView = listView;
    }

    async handleShowMemberList(message) {
        const periods = await this.periodServices.getAll();
        const memberReportsData = await this.memberServices.getWithReports({
            groupId: message.id.remote,
        });

        return this.listView.memberListWithReport({
            members: memberReportsData,
            periods,
        });
    }

    async handleShowAdminList(message) {
        const admins = await this.adminServices.getAll();

        return this.listView.adminList({
            admins,
        });
    }
}

module.exports = new ListHandler(periodServices, memberServices, listView);
