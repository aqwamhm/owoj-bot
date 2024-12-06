const { prisma } = require("../../config/db");
const periodServices = require("../period");

jest.mock("../../config/db", () => {
    const originalModule = jest.requireActual("../../config/db");
    return {
        ...originalModule,
        prisma: {
            period: {
                create: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
            },
            $connect: jest.fn(),
        },
    };
});

describe("periodServices", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("find", () => {
        it("should find a period with matching start and end dates", async () => {
            const mockPeriod = {
                id: 1,
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-01-07"),
            };
            const searchParams = {
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-01-07"),
            };

            prisma.period.findFirst.mockResolvedValue(mockPeriod);

            const result = await periodServices.find(searchParams);

            expect(prisma.period.findFirst).toHaveBeenCalledWith({
                where: {
                    startDate: searchParams.startDate,
                    endDate: searchParams.endDate,
                },
            });
            expect(result).toEqual(mockPeriod);
        });

        it("should return null if no matching period is found", async () => {
            const searchParams = {
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-01-07"),
            };

            prisma.period.findFirst.mockResolvedValue(null);

            const result = await periodServices.find(searchParams);

            expect(prisma.period.findFirst).toHaveBeenCalledWith({
                where: {
                    startDate: searchParams.startDate,
                    endDate: searchParams.endDate,
                },
            });
            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("should create a new period with the correct data", async () => {
            const mockData = {
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-12-31"),
            };
            prisma.period.create.mockResolvedValue(mockData);

            await periodServices.create(mockData);

            expect(prisma.period.create).toHaveBeenCalledWith({
                data: mockData,
            });
        });
    });

    describe("getAll", () => {
        it("should return all periods ordered by startDate in descending order", async () => {
            const mockPeriods = [
                {
                    startDate: new Date("2024-12-01"),
                    endDate: new Date("2024-12-31"),
                },
                {
                    startDate: new Date("2024-11-01"),
                    endDate: new Date("2024-11-30"),
                },
            ];
            prisma.period.findMany.mockResolvedValue(mockPeriods);

            const result = await periodServices.getAll();

            expect(prisma.period.findMany).toHaveBeenCalledWith({
                orderBy: { startDate: "desc" },
                select: { startDate: true, endDate: true },
            });
            expect(result).toEqual(mockPeriods);
        });

        it("should return an empty array if no periods exist", async () => {
            prisma.period.findMany.mockResolvedValue([]);

            const result = await periodServices.getAll();

            expect(result).toEqual([]);
        });
    });
});
