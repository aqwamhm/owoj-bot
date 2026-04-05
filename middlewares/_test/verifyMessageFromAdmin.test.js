const verifyMessageFromAdmin = require("../verifyMessageFromAdmin");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const adminServices = require("../../services/admin");

jest.mock("../../services/admin");

describe("verifyMessageFromAdmin", () => {
    let message;
    let client;

    beforeEach(() => {
        jest.clearAllMocks();
        message = {
            key: {
                remoteJid: "123456@s.whatsapp.net",
                participant: "628123456789@s.whatsapp.net",
            },
        };
        client = {
            groupMetadata: jest.fn(),
        };
    });

    test("should throw AuthorizationError if sender identity is not found", async () => {
        message.key.remoteJid = null;
        message.key.participant = null;
        message.participant = null;

        await expect(verifyMessageFromAdmin(message, client)).rejects.toThrow(
            AuthorizationError
        );
        await expect(verifyMessageFromAdmin(message, client)).rejects.toThrow(
            "Tidak dapat menjalankan command ini. Identitas pengirim tidak ditemukan."
        );
    });

    describe("Private Message Context", () => {
        test("should authorize if admin is found in database", async () => {
            message.key.remoteJid = "628123456789@s.whatsapp.net";
            adminServices.find.mockResolvedValue({ name: "Test Admin" });

            const result = await verifyMessageFromAdmin(message, client);

            expect(result.admin).toBeDefined();
            expect(adminServices.find).toHaveBeenCalledWith({
                phoneNumber: "628123456789",
            });
        });

        test("should throw AuthorizationError if admin is not found in database", async () => {
            message.key.remoteJid = "628123456789@s.whatsapp.net";
            adminServices.find.mockResolvedValue(null);

            await expect(verifyMessageFromAdmin(message, client)).rejects.toThrow(
                AuthorizationError
            );
        });
    });

    describe("Group Context", () => {
        beforeEach(() => {
            message.key.remoteJid = "123456@g.us";
            message.key.participant = "some-id@lid";
        });

        test("should authorize if user is a WhatsApp Group Admin (via message.key.participant)", async () => {
            message.key.participant = "some-id@lid";
            client.groupMetadata.mockResolvedValue({
                participants: [
                    { id: "some-id@lid", admin: "admin" }
                ]
            });

            const result = await verifyMessageFromAdmin(message, client);

            expect(result.admin.name).toBe("WhatsApp Admin");
            expect(result.admin.phoneNumber).toBe("some-id");
        });

        test("should authorize if user is a WhatsApp Group Admin (via message.key.participantPn)", async () => {
            message.key.participant = null;
            message.key.participantPn = "some-id@lid";
            client.groupMetadata.mockResolvedValue({
                participants: [
                    { id: "some-id@lid", admin: "admin" }
                ]
            });

            const result = await verifyMessageFromAdmin(message, client);

            expect(result.admin.phoneNumber).toBe("some-id");
        });

        test("should authorize if user is a WhatsApp Group Admin (via message.participant)", async () => {
            message.key.participant = null;
            message.key.participantPn = null;
            message.participant = "some-id@lid";
            client.groupMetadata.mockResolvedValue({
                participants: [
                    { id: "some-id@lid", admin: "admin" }
                ]
            });

            const result = await verifyMessageFromAdmin(message, client);

            expect(result.admin.phoneNumber).toBe("some-id");
        });

        test("should authorize if user is a WhatsApp Group Superadmin", async () => {
            client.groupMetadata.mockResolvedValue({
                participants: [
                    { id: "some-id@lid", admin: "superadmin" }
                ]
            });

            const result = await verifyMessageFromAdmin(message, client);

            expect(result.admin.name).toBe("WhatsApp Admin");
        });

        test("should fallback to database if user is not a group admin", async () => {
            client.groupMetadata.mockResolvedValue({
                participants: [
                    { id: "some-id@lid", admin: null }
                ]
            });
            // Mock DB check for the same ID (unlikely to match phone but for test coverage)
            adminServices.find.mockResolvedValue({ name: "DB Admin" });

            const result = await verifyMessageFromAdmin(message, client);

            expect(result.admin.name).toBe("DB Admin");
            expect(adminServices.find).toHaveBeenCalled();
        });

        test("should fallback to database if groupMetadata fails", async () => {
            client.groupMetadata.mockRejectedValue(new Error("Network Error"));
            adminServices.find.mockResolvedValue({ name: "DB Admin" });

            const result = await verifyMessageFromAdmin(message, client);

            expect(result.admin.name).toBe("DB Admin");
        });

        test("should throw AuthorizationError if neither Group Admin nor DB Admin", async () => {
            client.groupMetadata.mockResolvedValue({
                participants: [
                    { id: "some-id@lid", admin: null }
                ]
            });
            adminServices.find.mockResolvedValue(null);

            await expect(verifyMessageFromAdmin(message, client)).rejects.toThrow(
                AuthorizationError
            );
        });
    });
});
