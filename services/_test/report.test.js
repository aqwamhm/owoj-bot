const { prisma } = require("../../config/db");
const reportServices = require("../report");

jest.mock("../../config/db", () => {
    const originalModule = jest.requireActual("../../config/db");
    return {
        ...originalModule,
        prisma: {
            report: {
                upsert: jest.fn(),
                createMany: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
                delete: jest.fn(),
                deleteMany: jest.fn(),
                updateMany: jest.fn(),
            },
            $connect: jest.fn(),
        },
    };
});

describe("reportServices", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should create or update a report with the default type and pages if not provided", async () => {
            const mockData = {
                name: "John",
                groupId: "1",
                juz: 3,
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-12-31"),
            };

            await reportServices.create(mockData);

            expect(prisma.report.upsert).toHaveBeenCalledWith({
                where: {
                    memberName_memberGroupId_pages_totalPages_type_periodStartDate_periodEndDate:
                        {
                            memberName: "John",
                            memberGroupId: "1",
                            pages: 0,
                            totalPages: 0,
                            type: "TILAWAH",
                            periodStartDate: mockData.startDate,
                            periodEndDate: mockData.endDate,
                        },
                },
                create: {
                    member: {
                        connect: {
                            name_groupId: {
                                name: "John",
                                groupId: "1",
                            },
                        },
                    },
                    juz: 3,
                    pages: 0,
                    totalPages: 0,
                    type: "TILAWAH",
                    period: {
                        connectOrCreate: {
                            where: {
                                startDate_endDate: {
                                    startDate: mockData.startDate,
                                    endDate: mockData.endDate,
                                },
                            },
                            create: {
                                startDate: mockData.startDate,
                                endDate: mockData.endDate,
                            },
                        },
                    },
                },
                update: {
                    member: {
                        connect: {
                            name_groupId: {
                                name: "John",
                                groupId: "1",
                            },
                        },
                    },
                    juz: 3,
                    pages: 0,
                    totalPages: 0,
                    type: "TILAWAH",
                    period: {
                        connectOrCreate: {
                            where: {
                                startDate_endDate: {
                                    startDate: mockData.startDate,
                                    endDate: mockData.endDate,
                                },
                            },
                            create: {
                                startDate: mockData.startDate,
                                endDate: mockData.endDate,
                            },
                        },
                    },
                },
            });
        });

        it("should create or update a report with provided type, pages, and totalPages", async () => {
            const mockData = {
                name: "John",
                groupId: "1",
                juz: 5,
                pages: 10,
                totalPages: 30,
                type: "TILAWAH",
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-12-31"),
            };

            await reportServices.create(mockData);

            expect(prisma.report.upsert).toHaveBeenCalledWith({
                where: {
                    memberName_memberGroupId_pages_totalPages_type_periodStartDate_periodEndDate:
                        {
                            memberName: "John",
                            memberGroupId: "1",
                            pages: 0,
                            totalPages: 0,
                            type: "TILAWAH",
                            periodStartDate: mockData.startDate,
                            periodEndDate: mockData.endDate,
                        },
                },
                create: {
                    member: {
                        connect: {
                            name_groupId: {
                                name: "John",
                                groupId: "1",
                            },
                        },
                    },
                    juz: 5,
                    pages: 10,
                    totalPages: 30,
                    type: "TILAWAH",
                    period: {
                        connectOrCreate: {
                            where: {
                                startDate_endDate: {
                                    startDate: mockData.startDate,
                                    endDate: mockData.endDate,
                                },
                            },
                            create: {
                                startDate: mockData.startDate,
                                endDate: mockData.endDate,
                            },
                        },
                    },
                },
                update: {
                    member: {
                        connect: {
                            name_groupId: {
                                name: "John",
                                groupId: "1",
                            },
                        },
                    },
                    juz: 5,
                    pages: 10,
                    totalPages: 30,
                    type: "TILAWAH",
                    period: {
                        connectOrCreate: {
                            where: {
                                startDate_endDate: {
                                    startDate: mockData.startDate,
                                    endDate: mockData.endDate,
                                },
                            },
                            create: {
                                startDate: mockData.startDate,
                                endDate: mockData.endDate,
                            },
                        },
                    },
                },
            });
        });

        it("should handle a missing period and create a new one if not found", async () => {
            const mockData = {
                name: "Alice",
                groupId: "2",
                juz: 4,
                startDate: new Date("2024-06-01"),
                endDate: new Date("2024-06-07"),
            };

            await reportServices.create(mockData);

            expect(prisma.report.upsert).toHaveBeenCalledWith({
                where: {
                    memberName_memberGroupId_pages_totalPages_type_periodStartDate_periodEndDate:
                        {
                            memberName: "Alice",
                            memberGroupId: "2",
                            pages: 0,
                            totalPages: 0,
                            type: "TILAWAH",
                            periodStartDate: mockData.startDate,
                            periodEndDate: mockData.endDate,
                        },
                },
                create: {
                    member: {
                        connect: {
                            name_groupId: {
                                name: "Alice",
                                groupId: "2",
                            },
                        },
                    },
                    juz: 4,
                    pages: 0,
                    totalPages: 0,
                    type: "TILAWAH",
                    period: {
                        connectOrCreate: {
                            where: {
                                startDate_endDate: {
                                    startDate: mockData.startDate,
                                    endDate: mockData.endDate,
                                },
                            },
                            create: {
                                startDate: mockData.startDate,
                                endDate: mockData.endDate,
                            },
                        },
                    },
                },
                update: {
                    member: {
                        connect: {
                            name_groupId: {
                                name: "Alice",
                                groupId: "2",
                            },
                        },
                    },
                    juz: 4,
                    pages: 0,
                    totalPages: 0,
                    type: "TILAWAH",
                    period: {
                        connectOrCreate: {
                            where: {
                                startDate_endDate: {
                                    startDate: mockData.startDate,
                                    endDate: mockData.endDate,
                                },
                            },
                            create: {
                                startDate: mockData.startDate,
                                endDate: mockData.endDate,
                            },
                        },
                    },
                },
            });
        });
    });

    describe("createMany", () => {
        it("should create multiple reports and skip duplicates", async () => {
            const mockMembers = [
                { name: "Alice", groupId: "1", currentJuz: 1 },
                { name: "Bob", groupId: "1", currentJuz: 2 },
            ];
            const mockData = {
                members: mockMembers,
                pages: 5,
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-12-31"),
            };

            prisma.report.createMany.mockResolvedValue({ count: 2 });

            await reportServices.createMany(mockData);

            expect(prisma.report.createMany).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        memberName: "Alice",
                        memberGroupId: "1",
                        juz: 1,
                        pages: 5,
                    }),
                    expect.objectContaining({
                        memberName: "Bob",
                        memberGroupId: "1",
                        juz: 2,
                        pages: 5,
                    }),
                ]),
                skipDuplicates: true,
            });
        });
    });

    describe("findMany", () => {
        it("should find reports with the correct filters and order", async () => {
            const mockFilters = {
                memberName: "Alice",
                memberGroupId: "1",
                pages: 5,
                totalPages: 20,
                type: "TILAWAH",
                periodStartDate: new Date("2024-01-01"),
                periodEndDate: new Date("2024-12-31"),
            };

            prisma.report.findMany.mockResolvedValue([]);

            await reportServices.findMany(mockFilters);

            expect(prisma.report.findMany).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    memberName: "Alice",
                    memberGroupId: "1",
                    pages: 5,
                    totalPages: 20,
                    type: "TILAWAH",
                }),
                orderBy: {
                    createdAt: "desc",
                },
            });
        });

        it("should call createMany with default pages value", async () => {
            const members = [
                { name: "Member1", groupId: "Group1", currentJuz: 5 },
                { name: "Member2", groupId: "Group2", currentJuz: 10 },
            ];
            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-01-07");

            await reportServices.createMany({ members, startDate, endDate });

            expect(prisma.report.createMany).toHaveBeenCalledWith({
                data: [
                    {
                        memberName: "Member1",
                        memberGroupId: "Group1",
                        juz: 5,
                        pages: 0,
                        periodStartDate: startDate,
                        periodEndDate: endDate,
                    },
                    {
                        memberName: "Member2",
                        memberGroupId: "Group2",
                        juz: 10,
                        pages: 0,
                        periodStartDate: startDate,
                        periodEndDate: endDate,
                    },
                ],
                skipDuplicates: true,
            });
        });
    });

    describe("find", () => {
        it("should find a single report with the correct filters", async () => {
            const mockFilters = {
                memberName: "Alice",
                memberGroupId: "1",
                pages: 5,
                totalPages: 20,
                type: "TILAWAH",
                periodStartDate: new Date("2024-01-01"),
                periodEndDate: new Date("2024-12-31"),
            };

            prisma.report.findFirst.mockResolvedValue(null);

            await reportServices.find(mockFilters);

            expect(prisma.report.findFirst).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    memberName: "Alice",
                    memberGroupId: "1",
                    pages: 5,
                    totalPages: 20,
                    type: "TILAWAH",
                }),
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    });

    describe("delete", () => {
        it("should delete a specific report with the correct identifiers", async () => {
            const mockData = {
                memberName: "Alice",
                memberGroupId: "1",
                pages: 5,
                totalPages: 20,
                type: "TILAWAH",
                periodStartDate: new Date("2024-01-01"),
                periodEndDate: new Date("2024-12-31"),
            };

            prisma.report.delete.mockResolvedValue({});

            await reportServices.delete(mockData);

            expect(prisma.report.delete).toHaveBeenCalledWith({
                where: {
                    memberName_memberGroupId_pages_totalPages_type_periodStartDate_periodEndDate:
                        {
                            memberName: "Alice",
                            memberGroupId: "1",
                            pages: 5,
                            totalPages: 20,
                            type: "TILAWAH",
                            periodStartDate: mockData.periodStartDate,
                            periodEndDate: mockData.periodEndDate,
                        },
                },
            });
        });
    });

    describe("deleteMany", () => {
        it("should delete multiple reports based on filters", async () => {
            const mockFilters = {
                memberName: "Alice",
                memberGroupId: "1",
                periodStartDate: new Date("2024-01-01"),
                periodEndDate: new Date("2024-12-31"),
            };

            prisma.report.deleteMany.mockResolvedValue({ count: 1 });

            await reportServices.deleteMany(mockFilters);

            expect(prisma.report.deleteMany).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    memberName: "Alice",
                    memberGroupId: "1",
                }),
            });
        });
    });

    describe("updateMany", () => {
        it("should update multiple reports with the correct data", async () => {
            const mockData = {
                memberName: "Alice",
                memberGroupId: "1",
                periodStartDate: new Date("2024-01-01"),
                periodEndDate: new Date("2024-12-31"),
                juz: 3,
                totalPages: 30,
                type: "TILAWAH",
            };

            prisma.report.updateMany.mockResolvedValue({ count: 1 });

            await reportServices.updateMany(mockData);

            expect(prisma.report.updateMany).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    memberName: "Alice",
                    memberGroupId: "1",
                }),
                data: {
                    juz: 3,
                    totalPages: 30,
                    type: "TILAWAH",
                },
            });
        });
    });
});
