const listHandlers = require("../listHandlers");
const periodServices = require("../../services/period");
const memberServices = require("../../services/member");
const { memberListWithReport } = require("../../views/list");

jest.mock("../../services/period");
jest.mock("../../services/member");
jest.mock("../../views/list");

describe("listHandlers", () => {
    describe("handleShowList", () => {
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

            const result = await listHandlers.handleShowList(message);

            expect(result).toEqual("List of members with reports");
        });

        it("should handle empty periods and members gracefully", async () => {
            const message = { id: { remote: "groupId123" } };

            periodServices.getAll.mockResolvedValue([]);
            memberServices.getWithReports.mockResolvedValue([]);
            memberListWithReport.mockReturnValue("No members or periods found");

            const result = await listHandlers.handleShowList(message);

            expect(result).toEqual("No members or periods found");
        });
    });
});
