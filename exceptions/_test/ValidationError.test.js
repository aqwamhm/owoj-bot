const ValidationError = require("../ValidationError");

describe("ValidationError", () => {
    test("should be an instance of ClientError", () => {
        const error = new ValidationError("Validation error");
        expect(error).toBeInstanceOf(ValidationError);
        expect(error).toBeInstanceOf(require("../ClientError"));
    });

    test('should have a name of "ValidationError"', () => {
        const error = new ValidationError("Validation error");
        expect(error.name).toBe("ValidationError");
    });

    test("should have a default message", () => {
        const error = new ValidationError();
        expect(error.message).toBe("Command tidak valid!");
    });

    test("should have a custom message", () => {
        const error = new ValidationError("Custom validation error message");
        expect(error.message).toBe("Custom validation error message");
    });
});
