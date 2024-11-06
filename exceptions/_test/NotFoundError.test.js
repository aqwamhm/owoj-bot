const NotFoundError = require("../NotFoundError");

describe("NotFoundError", () => {
    test("should be an instance of ClientError", () => {
        const error = new NotFoundError("Not found error");
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error).toBeInstanceOf(require("../ClientError"));
    });

    test('should have a name of "NotFoundError"', () => {
        const error = new NotFoundError("Not found error");
        expect(error.name).toBe("NotFoundError");
    });

    test("should have a custom message", () => {
        const error = new NotFoundError("Custom not found error message");
        expect(error.message).toBe("Custom not found error message");
    });
});
