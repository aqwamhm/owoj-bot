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
        it("should create new period, increment member current juz, and create reports if period does not exist", async () => {
            const mockStartDate = "2023-01-01";
            const mockEndDate = "2023-01-07";

            getPeriodDate.mockReturnValue({
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            periodServices.find.mockResolvedValue(null);
            memberServices.findAll.mockResolvedValue([
                { id: 1, name: "Member 1", currentJuz: 1 },
            ]);
            reportServices.createMany.mockResolvedValue(true);

            groupServices.getAll.mockResolvedValue(null);

            await cronHandler.handleNewPeriod();

            expect(periodServices.create).toHaveBeenCalledWith({
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            expect(memberServices.incrementAllCurrentJuz).toHaveBeenCalled();
            expect(reportServices.createMany).toHaveBeenCalledWith({
                members: [{ id: 1, name: "Member 1", currentJuz: 1 }],
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
        });

        it("should not create new period, increment member current juz, or create reports if period exists", async () => {
            const mockStartDate = "2023-01-01";
            const mockEndDate = "2023-01-07";

            getPeriodDate.mockReturnValue({
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            periodServices.find.mockResolvedValue({
                id: 1,
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            groupServices.getAll.mockResolvedValue([]);

            await cronHandler.handleNewPeriod();

            expect(periodServices.find).toHaveBeenCalledWith({
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            expect(periodServices.create).not.toHaveBeenCalled();
            expect(
                memberServices.incrementAllCurrentJuz
            ).not.toHaveBeenCalled();
            expect(reportServices.createMany).not.toHaveBeenCalled();
        });

        it("should create a new period, increment member juz, create reports, and notify groups", async () => {
            const mockStartDate = "2023-01-01";
            const mockEndDate = "2023-01-07";
            const mockGroups = [
                { id: "groupId1", number: "001", admin: "admin1" },
                { id: "groupId2", number: "002", admin: "admin2" },
            ];

            getPeriodDate.mockReturnValue({
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            periodServices.find.mockResolvedValue(null);
            memberServices.findAll.mockResolvedValue([
                { id: 1, name: "Member 1" },
            ]);
            groupServices.getAll.mockResolvedValue(mockGroups);
            ListHandler.handleShowMemberList.mockResolvedValue("List message");

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

            expect(client.sendMessage).toHaveBeenCalledTimes(mockGroups.length);
            mockGroups.forEach((group) => {
                const expectedCombinedMessage = `${templateViews.doaKhatamQuran}\n\n------\n\n${templateViews.pembukaan}\n\n------\n\nList message`;
                expect(client.sendMessage).toHaveBeenCalledWith(group.id, {
                    text: expectedCombinedMessage,
                });
            });
        });

        it("should log an error if an exception is thrown during period creation", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            periodServices.create.mockRejectedValue(new Error("Test error"));
            groupServices.getAll.mockResolvedValue(null);

            await cronHandler.handleNewPeriod();

            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            consoleSpy.mockRestore();
        });

        it("should log an error when failing to send a message to a group", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const mockStartDate = "2023-01-01";
            const mockEndDate = "2023-01-07";
            const mockGroups = [
                { id: "groupId1", number: "001", admin: "admin1" },
                { id: "groupId2", number: "002", admin: "admin2" },
            ];
            const errorMessage = "Failed to send message";

            getPeriodDate.mockReturnValue({
                startDate: mockStartDate,
                endDate: mockEndDate,
            });
            periodServices.find.mockResolvedValue(null);
            memberServices.findAll.mockResolvedValue([
                { id: 1, name: "Member 1" },
            ]);
            groupServices.getAll.mockResolvedValue(mockGroups);
            ListHandler.handleShowMemberList.mockResolvedValue("List message");

            periodServices.create.mockResolvedValue({});
            memberServices.incrementAllCurrentJuz.mockResolvedValue();
            reportServices.createMany.mockResolvedValue();

            client.sendMessage.mockImplementation((id, messageObj) => {
                if (id === "groupId2") {
                    throw new Error(errorMessage);
                }
                return Promise.resolve();
            });

            await cronHandler.handleNewPeriod();

            expect(consoleSpy).toHaveBeenCalledWith(
                `Failed to send messages to group groupId2:`,
                expect.any(Error)
            );
            consoleSpy.mockRestore();
        });
    });

    describe("handleOneDayBeforeNewPeriod", () => {
        it("should send a reminder message with uncompleted member list to all groups", async () => {
            const groups = [{ id: "groupId1" }];
            groupServices.getAll.mockResolvedValue(groups);
            templateViews.oneDayReminder.mockReturnValue("Reminder message");
            ListHandler.handleShowUncompletedMemberList.mockResolvedValue(
                "Uncompleted members list"
            );

            await cronHandler.handleOneDayBeforeNewPeriod();

            const expectedMessage = `Reminder message\n\nUncompleted members list`;
            expect(client.sendMessage).toHaveBeenCalledWith("groupId1", {
                text: expectedMessage,
            });
        });

        it("should handle error when fetching uncompleted member list", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const groups = [{ id: "groupId1" }];
            groupServices.getAll.mockResolvedValue(groups);
            ListHandler.handleShowUncompletedMemberList.mockRejectedValue(
                new Error("List fetch error")
            );

            await cronHandler.handleOneDayBeforeNewPeriod();

            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            consoleSpy.mockRestore();
        });

        it("should log an error if getting groups fails in one day before new period", async () => {
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
