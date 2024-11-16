const ListHandler = require("../ListHandler");
const periodServices = require("../../services/period");
const memberServices = require("../../services/member");
const adminServices = require("../../services/admin");
const { memberListWithReport, adminList } = require("../../views/list");

jest.mock("../../services/period");
jest.mock("../../services/member");
jest.mock("../../services/admin");
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
});
