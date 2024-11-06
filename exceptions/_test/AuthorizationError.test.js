const AuthorizationError = require("../AuthorizationError");

describe("AuthorizationError", () => {
    test("should be an instance of ClientError", () => {
        const error = new AuthorizationError("Authorization failed");
        expect(error).toBeInstanceOf(AuthorizationError);
        expect(error).toBeInstanceOf(require("../ClientError"));
    });

    test('should have a name of "AuthorizationError"', () => {
        const error = new AuthorizationError("Authorization failed");
        expect(error.name).toBe("AuthorizationError");
    });

    test("should have a default message", () => {
        const error = new AuthorizationError();
        expect(error.message).toBe("Anda tidak memiliki akses ke command ini.");
    });

    test("should have a custom message", () => {
        const error = new AuthorizationError(
            "Custom authorization error message"
        );
        expect(error.message).toBe("Custom authorization error message");
    });
});
