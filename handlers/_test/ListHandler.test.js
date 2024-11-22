const ListHandler = require("../ListHandler");
const periodServices = require("../../services/period");
const memberServices = require("../../services/member");
const adminServices = require("../../services/admin");
const groupServices = require("../../services/group");
const {
    memberListWithReport,
    uncompletedMemberList,
    adminList,
    groupList,
} = require("../../views/list");

jest.mock("../../services/period");
jest.mock("../../services/member");
jest.mock("../../services/admin");
jest.mock("../../services/group");
jest.mock("../../views/list");

describe("ListHandler", () => {
    describe("handleShowMemberList", () => {
        it("should return a list of members with reports successfully", async () => {
            const message = { id: { remote: "groupId123" } };

            periodServices.getAll.mockResolvedValue([
                { id: 1, name: "Period 1" },
            ]);
            memberServices.getWithReports.mockResolvedValue([
                { id: 1, name: "Member 1", reports: [] },
            ]);
            memberListWithReport.mockReturnValue(
                "List of members with reports"
            );

            const result = await ListHandler.handleShowMemberList(message);

            expect(result).toEqual("List of members with reports");
        });
    });

    describe("handleShowMemberList", () => {
        it("should return a list of uncompleted members successfully", async () => {
            const message = { id: { remote: "groupId123" } };

            periodServices.getAll.mockResolvedValue([
                { id: 1, name: "Period 1" },
            ]);
            memberServices.getWithReports.mockResolvedValue([
                { id: 1, name: "Member 1", reports: [] },
            ]);
            uncompletedMemberList.mockReturnValue(
                "List of uncompleted members"
            );

            const result = await ListHandler.handleShowUncompletedMemberList(
                message
            );

            expect(result).toEqual("List of uncompleted members");
        });
    });

    describe("handleShowAdminList", () => {
        it("should return a list of admins successfully", async () => {
            const message = { id: { remote: "groupId123" } };

            adminServices.getAll.mockResolvedValue([
                { id: "id-1", name: "Aqwam", phoneNumber: "123456789" },
                { id: "id-2", name: "Budi", phoneNumber: "716318673" },
                { id: "id-3", name: "Ivo", phoneNumber: "128937981" },
            ]);

            adminList.mockReturnValue("List of admins");

            const result = await ListHandler.handleShowAdminList(message);

            expect(result).toEqual("List of admins");
        });
    });

    describe("handleShowGroupList", () => {
        it("should return a list of groups successfully", async () => {
            const message = { id: { remote: "groupId123" } };

            groupServices.getAll.mockResolvedValue([
                { id: "id-1", number: 1 },
                { id: "id-2", number: 2 },
                { id: "id-3", number: 3 },
            ]);

            groupList.mockReturnValue("List of groups");

            const result = await ListHandler.handleShowGroupList(message);

            expect(result).toEqual("List of groups");
        });
    });
});
