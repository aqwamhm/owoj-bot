const { prisma } = require("../../config/db");
const adminServices = require("../admin");

jest.mock("../../config/db", () => {
    const originalModule = jest.requireActual("../../config/db");
    return {
        ...originalModule,
        prisma: {
            admin: {
                create: jest.fn(),
                delete: jest.fn(),
                findFirst: jest.fn(),
            },
            $connect: jest.fn(),
        },
    };
});

describe("adminServices", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should call prisma.admin.create with the correct data", async () => {
            const mockData = { phoneNumber: "123456789", name: "Test User" };
            prisma.admin.create.mockResolvedValue(mockData);

            await adminServices.create(mockData);

            expect(prisma.admin.create).toHaveBeenCalledWith({
                data: {
                    phoneNumber: "123456789",
                    name: "Test User",
                },
            });
        });
    });

    describe("remove", () => {
        it("should call prisma.admin.delete with the correct phoneNumber", async () => {
            const mockPhoneNumber = "123456789";
            prisma.admin.delete.mockResolvedValue({});

            await adminServices.remove({ phoneNumber: mockPhoneNumber });

            expect(prisma.admin.delete).toHaveBeenCalledWith({
                where: {
                    phoneNumber: mockPhoneNumber,
                },
            });
        });
    });

    describe("find", () => {
        it("should call prisma.admin.findFirst with the correct phoneNumber and return result", async () => {
            const mockPhoneNumber = "123456789";
            const mockAdmin = {
                phoneNumber: mockPhoneNumber,
                name: "Test User",
            };
            prisma.admin.findFirst.mockResolvedValue(mockAdmin);

            const result = await adminServices.find({
                phoneNumber: mockPhoneNumber,
            });

            expect(prisma.admin.findFirst).toHaveBeenCalledWith({
                where: {
                    phoneNumber: mockPhoneNumber,
                },
            });
            expect(result).toEqual(mockAdmin);
        });

        it("should return null if no admin is found", async () => {
            prisma.admin.findFirst.mockResolvedValue(null);

            const result = await adminServices.find({
                phoneNumber: "nonexistent",
            });

            expect(result).toBeNull();
        });
    });
});
