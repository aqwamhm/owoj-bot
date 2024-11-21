const { prisma } = require("../../config/db");
const memberServices = require("../member");

jest.mock("../../config/db", () => {
    const originalModule = jest.requireActual("../../config/db");
    return {
        ...originalModule,
        prisma: {
            member: {
                update: jest.fn(),
                create: jest.fn(),
                delete: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
                updateMany: jest.fn(),
            },
            $connect: jest.fn(),
        },
    };
});

describe("memberServices", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("set", () => {
        it("should update member juz with the correct data", async () => {
            const mockData = {
                name: "Test User",
                groupId: "group1",
                currentJuz: 5,
            };
            await memberServices.set(mockData);

            expect(prisma.member.update).toHaveBeenCalledWith({
                where: {
                    name_groupId: {
                        name: mockData.name,
                        groupId: mockData.groupId,
                    },
                },
                data: { currentJuz: mockData.currentJuz },
            });
        });

        it("should update member name with the correct data", async () => {
            const mockData = {
                name: "Old Name",
                groupId: "group1",
                newName: "New Name",
            };
            await memberServices.set(mockData);

            expect(prisma.member.update).toHaveBeenCalledWith({
                where: {
                    name_groupId: {
                        name: mockData.name,
                        groupId: mockData.groupId,
                    },
                },
                data: { name: mockData.newName },
            });
        });
    });

    describe("create", () => {
        it("should create a new member with the correct data", async () => {
            const mockData = {
                name: "Test User",
                groupId: "group1",
                currentJuz: 5,
            };
            await memberServices.create(mockData);

            expect(prisma.member.create).toHaveBeenCalledWith({
                data: { ...mockData, currentJuz: 5 },
            });
        });
    });

    describe("remove", () => {
        it("should delete a member with the correct name and groupId", async () => {
            const mockData = { name: "Test User", groupId: "group1" };
            await memberServices.remove(mockData);

            expect(prisma.member.delete).toHaveBeenCalledWith({
                where: {
                    name_groupId: {
                        name: mockData.name,
                        groupId: mockData.groupId,
                    },
                },
            });
        });
    });

    describe("findAll", () => {
        it("should return all members", async () => {
            const mockMembers = [
                { name: "Test User 1" },
                { name: "Test User 2" },
            ];
            prisma.member.findMany.mockResolvedValue(mockMembers);

            const result = await memberServices.findAll();

            expect(prisma.member.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockMembers);
        });
    });

    describe("find", () => {
        it("should find a member based on given criteria", async () => {
            const mockData = {
                name: "Test User",
                groupId: "group1",
                currentJuz: 5,
            };
            prisma.member.findFirst.mockResolvedValue(mockData);

            const result = await memberServices.find(mockData);

            expect(prisma.member.findFirst).toHaveBeenCalledWith({
                where: { name: "Test User", groupId: "group1", currentJuz: 5 },
            });
            expect(result).toEqual(mockData);
        });

        it("should return null if no matching member is found", async () => {
            prisma.member.findFirst.mockResolvedValue(null);

            const result = await memberServices.find({ name: "Nonexistent" });

            expect(result).toBeNull();
        });
    });

    describe("incrementAllCurrentJuz", () => {
        it("should increment the currentJuz for all members and reset to 1 if greater than 30", async () => {
            await memberServices.incrementAllCurrentJuz();

            expect(prisma.member.updateMany).toHaveBeenCalledWith({
                data: { currentJuz: { increment: 1 } },
            });
            expect(prisma.member.updateMany).toHaveBeenCalledWith({
                where: { currentJuz: { gt: 30 } },
                data: { currentJuz: 1 },
            });
        });
    });

    describe("getWithReports", () => {
        it("should return members with reports for a specific group", async () => {
            const groupId = "group1";
            const mockMembers = [
                { name: "Test User 1", currentJuz: 5, reports: [] },
                { name: "Test User 2", currentJuz: 10, reports: [] },
            ];
            prisma.member.findMany.mockResolvedValue(mockMembers);

            const result = await memberServices.getWithReports({ groupId });

            expect(prisma.member.findMany).toHaveBeenCalledWith({
                where: { groupId },
                select: {
                    name: true,
                    currentJuz: true,
                    reports: true,
                },
                orderBy: {
                    name: "asc",
                },
            });
            expect(result).toEqual(mockMembers);
        });
    });
});
