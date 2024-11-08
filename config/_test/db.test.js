const { prisma, connectDB } = require("../db");

jest.mock("@prisma/client", () => {
    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            $connect: jest.fn(),
        })),
    };
});

describe("DB connection", () => {
    let consoleLogSpy;
    let consoleErrorSpy;
    let processExitSpy;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

        processExitSpy = jest.spyOn(process, "exit").mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should connect to the database successfully when NODE_ENV is not 'test'", async () => {
        process.env.NODE_ENV = "development";

        prisma.$connect.mockResolvedValueOnce();

        await connectDB();

        expect(prisma.$connect).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(
            "Database connection established successfully."
        );
        expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("should not connect to the database when NODE_ENV is 'test'", async () => {
        process.env.NODE_ENV = "test";

        await connectDB();

        expect(prisma.$connect).not.toHaveBeenCalled();
        expect(consoleLogSpy).not.toHaveBeenCalled();
        expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("should log an error and exit the process if there is an error connecting to the database", async () => {
        process.env.NODE_ENV = "development";

        const errorMessage = "Database connection failed";
        prisma.$connect.mockRejectedValueOnce(new Error(errorMessage));

        await connectDB();

        expect(prisma.$connect).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error connecting to the database:",
            expect.any(Error)
        );
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });
});
