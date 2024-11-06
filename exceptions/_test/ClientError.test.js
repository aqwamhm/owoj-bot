const ClientError = require("../ClientError");

describe("ClientError", () => {
    test("should be an instance of Error", () => {
        const error = new ClientError("Client error");
        expect(error).toBeInstanceOf(ClientError);
        expect(error).toBeInstanceOf(Error);
    });

    test('should have a name of "ClientError"', () => {
        const error = new ClientError("Client error");
        expect(error.name).toBe("ClientError");
    });

    test("should have a default message", () => {
        const error = new ClientError();
        expect(error.message).toBe("Terjadi kesalahan");
    });

    test("should have a custom message", () => {
        const error = new ClientError("Custom client error message");
        expect(error.message).toBe("Custom client error message");
    });
});
