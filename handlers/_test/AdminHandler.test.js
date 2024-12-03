const AdminHandler = require("../AdminHandler");
const adminServices = require("../../services/admin");
const { validate } = require("../../utils/validator");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");
const ConflictError = require("../../exceptions/ConflictError");
const adminViews = require("../../views/admin");

jest.mock("../../services/admin");
jest.mock("../../utils/validator");
jest.mock("../../views/error");
jest.mock("../../views/admin");

const originalEnv = process.env;

describe("AdminHandler", () => {
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv, ADMIN_PASSWORD: "mock-password" };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("handleRegisterAdmin", () => {
        it("should register a new admin successfully", async () => {
            const message = {
                body: "/register-admin Aqwam#6281234567 mock-password",
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                phone: "6281234567",
                password: "mock-password",
            });
            adminServices.find.mockResolvedValue(null);
            adminServices.create.mockResolvedValue(true);

            const result = await AdminHandler.handleRegisterAdmin({
                message,
                validation,
            });

            expect(result).toEqual(
                adminViews.success.create({
                    name: "Aqwam",
                    phone: "6281234567",
                })
            );
        });

        it("should throw AuthenticationError if password is incorrect", async () => {
            const message = {
                body: "/register-admin Aqwam#6281234567 wrong-password",
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                phone: "6281234567",
                password: "wrong-password",
            });

            await expect(
                AdminHandler.handleRegisterAdmin({ message, validation })
            ).rejects.toThrow(AuthenticationError);
        });

        it("should throw ConflictError if admin already exists", async () => {
            const message = {
                body: "/register-admin Aqwam#6281234567 mock-password",
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                phone: "6281234567",
                password: "mock-password",
            });
            adminServices.find.mockResolvedValue({ phoneNumber: "6281234567" });

            await expect(
                AdminHandler.handleRegisterAdmin({ message, validation })
            ).rejects.toThrow(ConflictError);
        });
    });

    describe("handleRemoveAdmin", () => {
        it("should remove an admin successfully", async () => {
            const message = { body: "/remove-admin 6212345678" };
            const validation = {};

            validate.mockReturnValue({ phone: "6212345678" });
            adminServices.find.mockResolvedValue({
                phoneNumber: "6212345678",
                name: "Aqwam",
            });
            adminServices.remove.mockResolvedValue(true);

            const result = await AdminHandler.handleRemoveAdmin({
                message,
                validation,
            });

            expect(result).toEqual(
                adminViews.success.remove({
                    name: "Aqwam",
                    phone: "6212345678",
                })
            );
        });

        it("should throw NotFoundError if admin does not exist", async () => {
            const message = { body: "/remove-admin 6212345678" };
            const validation = {};

            validate.mockReturnValue({ phone: "6212345678" });
            adminServices.find.mockResolvedValue(null);

            await expect(
                AdminHandler.handleRemoveAdmin({ message, validation })
            ).rejects.toThrow(NotFoundError);
        });
    });
});
