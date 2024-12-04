const { prisma } = require("../../config/db");
const ConflictError = require("../../exceptions/ConflictError");
const groupServices = require("../group");

jest.mock("../../config/db", () => {
    const originalModule = jest.requireActual("../../config/db");
    return {
        ...originalModule,
        prisma: {
            group: {
                create: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(),
                delete: jest.fn(),
                update: jest.fn(),
            },
            $connect: jest.fn(),
        },
    };
});

describe("groupServices", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should throw a ConflictError if a group with the same ID exists", async () => {
            const mockGroup = { id: "group1", number: 1 };
            prisma.group.findUnique.mockResolvedValue(mockGroup);

            await expect(groupServices.create(mockGroup)).rejects.toThrow(
                ConflictError
            );

            expect(prisma.group.findUnique).toHaveBeenCalledWith({
                include: { admin: true },
                where: { id: mockGroup.id },
            });
            expect(prisma.group.create).not.toHaveBeenCalled();
        });

        it("should call prisma.group.create with the correct data when no conflict", async () => {
            const mockGroup = { id: "group1", number: 1 };
            prisma.group.findUnique.mockResolvedValue(null);
            prisma.group.create.mockResolvedValue(mockGroup);

            await groupServices.create(mockGroup);

            expect(prisma.group.findUnique).toHaveBeenCalledWith({
                include: { admin: true },
                where: { id: mockGroup.id },
            });
            expect(prisma.group.create).toHaveBeenCalledWith({
                data: mockGroup,
            });
        });
    });

    describe("find", () => {
        it("should call prisma.group.findUnique with the correct ID and return the group", async () => {
            const mockGroup = { id: "group1", number: 1 };
            prisma.group.findUnique.mockResolvedValue(mockGroup);

            const result = await groupServices.find({ id: mockGroup.id });

            expect(prisma.group.findUnique).toHaveBeenCalledWith({
                include: { admin: true },
                where: { id: mockGroup.id },
            });
            expect(result).toEqual(mockGroup);
        });

        it("should return null if no group is found", async () => {
            prisma.group.findUnique.mockResolvedValue(null);

            const result = await groupServices.find({ id: "nonexistent" });

            expect(result).toBeNull();
        });
    });

    describe("getAll", () => {
        it("should call prisma.group.findMany and return all groups", async () => {
            const mockGroups = [
                { id: "group1", number: 1 },
                { id: "group2", number: 2 },
            ];
            prisma.group.findMany.mockResolvedValue(mockGroups);

            const result = await groupServices.getAll();

            expect(prisma.group.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockGroups);
        });
    });

    describe("remove", () => {
        it("should call prisma.group.delete with the correct ID", async () => {
            const mockGroup = { id: "group1", number: 1 };
            prisma.group.delete.mockResolvedValue(true);

            await groupServices.remove(mockGroup);

            expect(prisma.group.delete).toHaveBeenCalledWith({
                where: { id: mockGroup.id },
            });
        });
    });

    describe("update", () => {
        it("should call prisma.group.update with the correct ID and admin phone number", async () => {
            const mockGroup = { id: "group1", number: 1 };
            prisma.group.update.mockResolvedValue(true);

            await groupServices.update({
                id: mockGroup.id,
                adminPhoneNumber: "123456789",
            });

            expect(prisma.group.update).toHaveBeenCalledWith({
                data: { adminPhoneNumber: "123456789" },
                where: { id: mockGroup.id },
            });
        });
    });
});
