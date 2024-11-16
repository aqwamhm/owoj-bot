const periodServices = require("../services/period");
const memberServices = require("../services/member");
const adminServices = require("../services/admin");
const groupServices = require("../services/group");
const listView = require("../views/list");

class ListHandler {
    constructor(
        periodServices,
        memberServices,
        adminServices,
        groupServices,
        listView
    ) {
        this.periodServices = periodServices;
        this.memberServices = memberServices;
        this.adminServices = adminServices;
        this.groupServices = groupServices;
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

    async handleShowGroupList(message) {
        const groups = await this.groupServices.getAll();

        return this.listView.groupList({
            groups,
        });
    }
}

module.exports = new ListHandler(
    periodServices,
    memberServices,
    adminServices,
    groupServices,
    listView
);
