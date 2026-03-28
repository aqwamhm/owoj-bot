const groupServices = require("../../services/group");
const memberServices = require("../../services/member");
const periodServices = require("../../services/period");
const templateViews = require("../../views/template");
const { getPeriodDate } = require("../../utils/date");
const { prisma } = require("../../config/db");
const ListHandler = require("../ListHandler");
const CronHandler = require("../CronHandler");

jest.mock("../../services/group");
jest.mock("../../services/member");
jest.mock("../../services/period");
jest.mock("../../views/template");
jest.mock("../../utils/date");
jest.mock("../../config/db", () => ({
    prisma: {
        $transaction: jest.fn(),
    },
}));
jest.mock("../ListHandler");

describe("CronHandler", () => {
    let client;
    let cronHandler;

    const mockStartDate = "2023-01-01";
    const mockEndDate = "2023-01-07";

    beforeEach(() => {
        client = {
            sendMessage: jest.fn(),
        };
        cronHandler = new CronHandler(client);

        getPeriodDate.mockReturnValue({
            startDate: mockStartDate,
            endDate: mockEndDate,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("handleNewPeriod", () => {
        it("should create new period, increment member current juz, and create reports atomically if period does not exist", async () => {
            periodServices.find.mockResolvedValue(null);
            groupServices.getAll.mockResolvedValue(null);

            // Mock $transaction to execute the callback with a fake tx client
            const mockTx = {
                member: {
                    findMany: jest.fn().mockResolvedValue([
                        { name: "Member 1", groupId: "group1", currentJuz: 2 },
                    ]),
                },
                report: {
                    createMany: jest.fn().mockResolvedValue({ count: 1 }),
                },
            };
            prisma.$transaction.mockImplementation(async (fn) => {
                await fn(mockTx);
            });

            await cronHandler.handleNewPeriod();

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
            expect(periodServices.create).toHaveBeenCalledWith(
                { startDate: mockStartDate, endDate: mockEndDate },
                mockTx
            );
            expect(memberServices.incrementAllCurrentJuz).toHaveBeenCalledWith(
                mockTx
            );
            expect(mockTx.member.findMany).toHaveBeenCalled();
            expect(mockTx.report.createMany).toHaveBeenCalledWith({
                data: [
                    {
                        memberName: "Member 1",
                        memberGroupId: "group1",
                        juz: 2,
                        pages: 0,
                        periodStartDate: mockStartDate,
                        periodEndDate: mockEndDate,
                    },
                ],
                skipDuplicates: true,
            });
        });

        it("should not create new period, increment member current juz, or create reports if period exists", async () => {
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
            expect(prisma.$transaction).not.toHaveBeenCalled();
            expect(periodServices.create).not.toHaveBeenCalled();
            expect(
                memberServices.incrementAllCurrentJuz
            ).not.toHaveBeenCalled();
        });

        it("should create a new period, increment member juz, create reports, and notify groups", async () => {
            const mockGroups = [
                { id: "groupId1", number: "001", admin: "admin1" },
                { id: "groupId2", number: "002", admin: "admin2" },
            ];

            periodServices.find.mockResolvedValue(null);
            groupServices.getAll.mockResolvedValue(mockGroups);
            ListHandler.handleShowMemberList.mockResolvedValue("List message");

            const mockTx = {
                member: {
                    findMany: jest.fn().mockResolvedValue([
                        { name: "Member 1", groupId: "group1", currentJuz: 2 },
                    ]),
                },
                report: {
                    createMany: jest.fn().mockResolvedValue({ count: 1 }),
                },
            };
            prisma.$transaction.mockImplementation(async (fn) => {
                await fn(mockTx);
            });

            await cronHandler.handleNewPeriod();

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
            expect(periodServices.create).toHaveBeenCalledWith(
                { startDate: mockStartDate, endDate: mockEndDate },
                mockTx
            );
            expect(memberServices.incrementAllCurrentJuz).toHaveBeenCalledWith(
                mockTx
            );

            expect(client.sendMessage).toHaveBeenCalledTimes(
                mockGroups.length
            );
            mockGroups.forEach((group) => {
                const expectedCombinedMessage = `${templateViews.doaKhatamQuran}\n\n------\n\n${templateViews.pembukaan}\n\n------\n\nList message`;
                expect(client.sendMessage).toHaveBeenCalledWith(group.id, {
                    text: expectedCombinedMessage,
                });
            });
        });

        it("should rollback everything and NOT send messages when transaction fails", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const consoleInfoSpy = jest
                .spyOn(console, "info")
                .mockImplementation(() => {});
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((fn) => fn());

            periodServices.find.mockResolvedValue(null);
            groupServices.getAll.mockResolvedValue([
                { id: "groupId1", number: "001", admin: "admin1" },
            ]);

            // Simulate transaction failure on all attempts
            prisma.$transaction.mockRejectedValue(
                new Error("DB connection lost")
            );

            await cronHandler.handleNewPeriod();

            // Transaction was retried 3 times
            expect(prisma.$transaction).toHaveBeenCalledTimes(3);

            // Messages were NOT sent (handler caught the fatal error)
            expect(client.sendMessage).not.toHaveBeenCalled();

            // Error was logged
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Transaction attempt"),
                expect.any(String)
            );

            consoleSpy.mockRestore();
            consoleInfoSpy.mockRestore();
            global.setTimeout = originalSetTimeout;
        });

        it("should succeed on retry after first transaction attempt fails", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const consoleInfoSpy = jest
                .spyOn(console, "info")
                .mockImplementation(() => {});
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((fn) => fn());

            periodServices.find.mockResolvedValue(null);
            groupServices.getAll.mockResolvedValue([]);

            const mockTx = {
                member: {
                    findMany: jest.fn().mockResolvedValue([]),
                },
                report: {
                    createMany: jest.fn().mockResolvedValue({ count: 0 }),
                },
            };

            prisma.$transaction
                .mockRejectedValueOnce(new Error("Temporary failure"))
                .mockImplementation(async (fn) => {
                    await fn(mockTx);
                });

            await cronHandler.handleNewPeriod();

            // First attempt failed, second succeeded
            expect(prisma.$transaction).toHaveBeenCalledTimes(2);
            expect(periodServices.create).toHaveBeenCalledTimes(1);
            expect(
                memberServices.incrementAllCurrentJuz
            ).toHaveBeenCalledTimes(1);

            consoleSpy.mockRestore();
            consoleInfoSpy.mockRestore();
            global.setTimeout = originalSetTimeout;
        });

        it("should log an error if an exception is thrown during period creation", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const consoleInfoSpy = jest
                .spyOn(console, "info")
                .mockImplementation(() => {});
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((fn) => fn());

            periodServices.find.mockResolvedValue(null);
            groupServices.getAll.mockResolvedValue(null);

            prisma.$transaction.mockRejectedValue(new Error("Test error"));

            await cronHandler.handleNewPeriod();

            expect(consoleSpy).toHaveBeenCalledWith(
                "[handleNewPeriod] Fatal error:",
                expect.any(Error)
            );
            consoleSpy.mockRestore();
            consoleInfoSpy.mockRestore();
            global.setTimeout = originalSetTimeout;
        });

        it("should log an error when failing to send a message to a group", async () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const consoleInfoSpy = jest
                .spyOn(console, "info")
                .mockImplementation(() => {});

            const mockGroups = [
                { id: "groupId1", number: "001", admin: "admin1" },
                { id: "groupId2", number: "002", admin: "admin2" },
            ];
            const errorMessage = "Failed to send message";

            periodServices.find.mockResolvedValue(null);
            groupServices.getAll.mockResolvedValue(mockGroups);
            ListHandler.handleShowMemberList.mockResolvedValue("List message");

            const mockTx = {
                member: {
                    findMany: jest.fn().mockResolvedValue([]),
                },
                report: {
                    createMany: jest.fn().mockResolvedValue({ count: 0 }),
                },
            };
            prisma.$transaction.mockImplementation(async (fn) => {
                await fn(mockTx);
            });

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
            consoleInfoSpy.mockRestore();
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

    describe("_sendWithThrottle", () => {
        it("should retry sending message on rate limit error (429)", async () => {
            const consoleWarnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});
            const originalDelay = global.setTimeout;
            global.setTimeout = jest.fn((fn) => fn()); // Mock setTimeout to execute immediately

            client.sendMessage
                .mockRejectedValueOnce({ data: 429 }) // First attempt: rate limit
                .mockResolvedValueOnce({}); // Second attempt: success

            await cronHandler._sendWithThrottle("testJid", "testText");

            expect(client.sendMessage).toHaveBeenCalledTimes(2);
            expect(client.sendMessage).toHaveBeenCalledWith("testJid", {
                text: "testText",
            });
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                `Rate limit hit on testJid, retrying in 5s (attempt 1)`
            );

            consoleWarnSpy.mockRestore();
            global.setTimeout = originalDelay; // Restore original setTimeout
        });

        it("should retry sending message on rate limit error (500 status code)", async () => {
            const consoleWarnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});
            const originalDelay = global.setTimeout;
            global.setTimeout = jest.fn((fn) => fn()); // Mock setTimeout to execute immediately

            client.sendMessage
                .mockRejectedValueOnce({
                    output: { statusCode: 500 },
                }) // First attempt: rate limit
                .mockResolvedValueOnce({}); // Second attempt: success

            await cronHandler._sendWithThrottle("testJid", "testText");

            expect(client.sendMessage).toHaveBeenCalledTimes(2);
            expect(client.sendMessage).toHaveBeenCalledWith("testJid", {
                text: "testText",
            });
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                `Rate limit hit on testJid, retrying in 5s (attempt 1)`
            );

            consoleWarnSpy.mockRestore();
            global.setTimeout = originalDelay; // Restore original setTimeout
        });

        it("should throw error if not a rate limit error (e.data not 429 and e.output.statusCode not 500)", async () => {
            const consoleWarnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});
            const originalDelay = global.setTimeout;
            global.setTimeout = jest.fn((fn) => fn()); // Mock setTimeout to execute immediately

            client.sendMessage.mockRejectedValue({
                output: { statusCode: 400 },
                data: 400,
            }); // Not a rate limit error

            await expect(
                cronHandler._sendWithThrottle("testJid", "testText")
            ).rejects.toEqual({ output: { statusCode: 400 }, data: 400 });

            expect(client.sendMessage).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).not.toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
            global.setTimeout = originalDelay; // Restore original setTimeout
        });

        it("should throw error if not a rate limit error (generic error)", async () => {
            const consoleWarnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});
            const originalDelay = global.setTimeout;
            global.setTimeout = jest.fn((fn) => fn()); // Mock setTimeout to execute immediately

            client.sendMessage.mockRejectedValue(new Error("Generic error"));

            await expect(
                cronHandler._sendWithThrottle("testJid", "testText")
            ).rejects.toThrow("Generic error");

            expect(client.sendMessage).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).not.toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
            global.setTimeout = originalDelay; // Restore original setTimeout
        });

        it("should throw error after 3 retries on rate limit", async () => {
            const consoleWarnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});
            const originalDelay = global.setTimeout;
            global.setTimeout = jest.fn((fn) => fn()); // Mock setTimeout to execute immediately

            client.sendMessage.mockRejectedValue({ data: 429 }); // Always rate limit

            await expect(
                cronHandler._sendWithThrottle("testJid", "testText")
            ).rejects.toEqual({ data: 429 });

            expect(client.sendMessage).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
            expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                `Rate limit hit on testJid, retrying in 5s (attempt 1)`
            );
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                `Rate limit hit on testJid, retrying in 5s (attempt 2)`
            );
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                `Rate limit hit on testJid, retrying in 5s (attempt 3)`
            );

            consoleWarnSpy.mockRestore();
            global.setTimeout = originalDelay; // Restore original setTimeout
        });
    });
});
