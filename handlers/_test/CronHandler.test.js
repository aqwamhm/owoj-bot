const groupServices = require("../../services/group");
const memberServices = require("../../services/member");
const periodServices = require("../../services/period");
const reportServices = require("../../services/report");
const templateViews = require("../../views/template");
const { getPeriodDate } = require("../../utils/date");
const ListHandler = require("../ListHandler");
const CronHandler = require("../CronHandler");

jest.mock("../../services/group");
jest.mock("../../services/member");
jest.mock("../../services/period");
jest.mock("../../services/report");
jest.mock("../../views/template");
jest.mock("../../utils/date");
jest.mock("../ListHandler");

describe("CronHandler", () => {
    let client;
    let cronHandler;

    beforeEach(() => {
        client = {
            sendMessage: jest.fn(),
        };
        cronHandler = new CronHandler(client);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("handleNewPeriod", () => {
        it("should create a new period, increment member juz, create reports, and notify groups", async () => {
            const mockStartDate = "2023-01-01";
            const mockEndDate = "2023-01-07";
            getPeriodDate.mockReturnValue({
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            memberServices.findAll.mockResolvedValue([
                { id: 1, name: "Member 1" },
            ]);
            groupServices.getAll.mockResolvedValue([{ id: "groupId1" }]);
            ListHandler.handleShowList.mockResolvedValue("List message");

            await cronHandler.handleNewPeriod();

            expect(periodServices.create).toHaveBeenCalledWith({
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            expect(memberServices.incrementAllCurrentJuz).toHaveBeenCalled();
            expect(reportServices.createMany).toHaveBeenCalledWith({
                members: [{ id: 1, name: "Member 1" }],
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            expect(client.sendMessage).toHaveBeenCalledWith(
                "groupId1",
                templateViews.doaKhatamQuran
            );
            expect(client.sendMessage).toHaveBeenCalledWith(
                "groupId1",
                templateViews.pembukaan
            );
            expect(client.sendMessage).toHaveBeenCalledWith(
                "groupId1",
                "List message"
            );
        });

        it("should log an error if an exception is thrown", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            periodServices.create.mockRejectedValue(new Error("Test error"));

            await cronHandler.handleNewPeriod();

            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe("handleOneDayBeforeNewPeriod", () => {
        it("should send a reminder message to all groups", async () => {
            groupServices.getAll.mockResolvedValue([{ id: "groupId1" }]);
            templateViews.oneDayReminder.mockReturnValue("Reminder message");

            await cronHandler.handleOneDayBeforeNewPeriod();

            expect(client.sendMessage).toHaveBeenCalledWith(
                "groupId1",
                "Reminder message"
            );
        });

        it("should log an error if an exception is thrown", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            groupServices.getAll.mockRejectedValue(new Error("Test error"));

            await cronHandler.handleOneDayBeforeNewPeriod();

            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});
