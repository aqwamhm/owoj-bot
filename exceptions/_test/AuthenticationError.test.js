const AuthenticationError = require("../AuthenticationError");

describe("AuthenticationError", () => {
    test("should be an instance of ClientError", () => {
        const error = new AuthenticationError("Authentication failed");
        expect(error).toBeInstanceOf(AuthenticationError);
        expect(error).toBeInstanceOf(require("../ClientError"));
    });

    test('should have a name of "AuthenticationError"', () => {
        const error = new AuthenticationError("Authentication failed");
        expect(error.name).toBe("AuthenticationError");
    });

    test("should have a custom message", () => {
        const error = new AuthenticationError(
            "Custom authentication error message"
        );
        expect(error.message).toBe("Custom authentication error message");
    });
});
