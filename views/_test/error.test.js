const errorMessages = require("../error");

describe("errorMessages", () => {
    describe("validation", () => {
        it("should return the correct error message with format", () => {
            const format = "format-example";
            const example = "example-value";
            const message = errorMessages.validation({ format, example });
            expect(message).toContain("Command tidak valid!");
            expect(message).toContain("format-example");
            expect(message).toContain("example-value");
        });

        it("should return the correct error message with example", () => {
            const example = "example-value";
            const message = errorMessages.validation({ example });
            expect(message).toContain("Command tidak valid!");
            expect(message).toContain("example-value");
        });

        it("should return the correct error message with neither format nor example", () => {
            const message = errorMessages.validation({});
            expect(message).toContain("Command tidak valid!");
        });
    });
});
