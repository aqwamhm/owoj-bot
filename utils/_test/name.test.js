const { formatName } = require("../name");

describe("Utils - formatName", () => {
    it("should capitalize the first letter of each word and lowercase the rest", () => {
        expect(formatName("john doe")).toBe("John Doe");
        expect(formatName("MARY ANN")).toBe("Mary Ann");
        expect(formatName("tOm HaNks")).toBe("Tom Hanks");
    });

    it("should handle single-word names", () => {
        expect(formatName("susan")).toBe("Susan");
        expect(formatName("ROBERT")).toBe("Robert");
    });

    it("should handle names with multiple spaces between words", () => {
        expect(formatName("john   doe")).toBe("John Doe");
    });

    it("should return an empty string if the input is an empty string", () => {
        expect(formatName("")).toBe("");
    });

    it("should handle names with leading or trailing spaces", () => {
        expect(formatName("  john doe  ")).toBe("John Doe");
    });
});
