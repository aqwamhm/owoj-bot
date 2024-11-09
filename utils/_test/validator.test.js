const { validate } = require("../validator");
const ValidationError = require("../../exceptions/ValidationError");

describe("validate", () => {
    describe("single match validation", () => {
        it("should return matched groups for valid single match command", () => {
            const input = {
                command: "/lapor Aqwam#1/5",
                validation: {
                    regex: /^\/lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+\/\d+|terjemah|murottal)\s*$/,
                    multiple: false,
                },
                errorMessage: "Invalid lapor command",
            };

            const result = validate(input);

            expect(result).toEqual({
                name: "Aqwam",
                pagesOrType: "1/5",
            });
        });

        it("should throw ValidationError for invalid single match command", () => {
            const input = {
                command: "/lapor Aqwam@1/5", // Using @ instead of #
                validation: {
                    regex: /^\/lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+\/\d+|terjemah|murottal)\s*$/,
                    multiple: false,
                },
                errorMessage: "Invalid lapor command",
            };

            expect(() => validate(input)).toThrow(ValidationError);
            expect(() => validate(input)).toThrow("Invalid lapor command");
        });

        it("should return undefined for match without named groups", () => {
            const input = {
                command: "/list",
                validation: {
                    regex: /^\/list\s*$/,
                    multiple: false,
                },
                errorMessage: "Invalid list command",
            };

            const result = validate(input);

            expect(result).toBeUndefined();
        });
    });

    describe("multiple match validation", () => {
        it("should return array of matched groups for valid multiple match command", () => {
            const input = {
                command: "1#Aqwam 2#Ivo",
                validation: {
                    regex: /(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*(?=\d|$)/g,
                    multiple: true,
                },
                errorMessage: "Invalid register command",
            };

            const result = validate(input);

            expect(result).toEqual([
                { juz: "1", name: "Aqwam" },
                { juz: "2", name: "Ivo" },
            ]);
        });

        it("should throw ValidationError when no matches found in multiple mode", () => {
            const input = {
                command: "1@Aqwam 2@Ivo",
                validation: {
                    regex: /(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*(?=\d|$)/g,
                    multiple: true,
                },
                errorMessage: "Invalid register command",
            };

            expect(() => validate(input)).toThrow(ValidationError);
            expect(() => validate(input)).toThrow("Invalid register command");
        });

        it("should handle single match in multiple mode", () => {
            const input = {
                command: "1#Aqwam",
                validation: {
                    regex: /(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*(?=\d|$)/g,
                    multiple: true,
                },
                errorMessage: "Invalid register command",
            };

            const result = validate(input);

            expect(result).toEqual([{ juz: "1", name: "Aqwam" }]);
        });
    });
});
