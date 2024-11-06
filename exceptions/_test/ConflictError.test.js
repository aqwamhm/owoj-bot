const ConflictError = require("../ConflictError");

describe("ConflictError", () => {
    test("should be an instance of ClientError", () => {
        const error = new ConflictError("Conflict error");
        expect(error).toBeInstanceOf(ConflictError);
        expect(error).toBeInstanceOf(require("../ClientError"));
    });

    test('should have a name of "ConflictError"', () => {
        const error = new ConflictError("Conflict error");
        expect(error.name).toBe("ConflictError");
    });

    test("should have a custom message", () => {
        const error = new ConflictError("Custom conflict error message");
        expect(error.message).toBe("Custom conflict error message");
    });
});
