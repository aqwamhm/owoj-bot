const verifyMessageFromAdmin = require("../verifyMessageFromAdmin");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const adminServices = require("../../services/admin");

jest.mock("../../services/admin");

describe("verifyMessageFromAdmin", () => {
    let message;

    beforeEach(() => {
        message = {
            getContact: jest.fn().mockResolvedValue({ number: "1234567890" }),
        };
    });

    test("should throw AuthorizationError if admin is not found", async () => {
        await adminServices.find.mockResolvedValue(null);

        await expect(verifyMessageFromAdmin(message)).rejects.toThrow(
            AuthorizationError
        );
        await expect(verifyMessageFromAdmin(message)).rejects.toThrow(
            "Tidak dapat menjalankan command ini. Nomor anda tidak terdaftar sebagai admin."
        );
    });

    test("should not throw an error if admin is found", async () => {
        await adminServices.find.mockResolvedValue({});

        await expect(verifyMessageFromAdmin(message)).resolves.not.toThrow();
    });
});
