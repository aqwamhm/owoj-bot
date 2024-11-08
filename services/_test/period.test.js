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
            },
            $connect: jest.fn(),
        },
    };
});

describe("periodServices", () => {
    afterEach(() => {
        jest.clearAllMocks();
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
