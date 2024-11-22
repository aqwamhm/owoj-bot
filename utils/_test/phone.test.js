const { standardizePhoneNumber, formatPhoneNumber } = require("../phone");

describe("standardizePhoneNumber", () => {
    it("removes spaces and dashes and replaces leading 0 with 62", () => {
        expect(standardizePhoneNumber("+62 896-1554-5511")).toBe(
            "6289615545511"
        );
    });

    it("replaces leading 0 with 62", () => {
        expect(standardizePhoneNumber("089615545511")).toBe("6289615545511");
    });

    it("handles input without special characters", () => {
        expect(standardizePhoneNumber("6289615545511")).toBe("6289615545511");
    });

    it("handles multiple non-digit characters", () => {
        expect(standardizePhoneNumber("+62 (896) 155-4551")).toBe(
            "628961554551"
        );
    });

    it("handles input with multiple leading zeros", () => {
        expect(standardizePhoneNumber("0089615545511")).toBe("62089615545511");
    });

    it("handles empty input", () => {
        expect(standardizePhoneNumber("")).toBe("");
    });
});

describe("formatPhoneNumber", () => {
    it("formats an 11-digit number correctly", () => {
        expect(formatPhoneNumber("6289615545511")).toBe("+62 896-1554-5511");
    });

    it("formats a 10-digit number correctly", () => {
        expect(formatPhoneNumber("62811101459")).toBe("+62 811-101-459");
    });

    it("formats a 9-digit number correctly", () => {
        expect(formatPhoneNumber("62896155455")).toBe("+62 896-155-455");
    });

    it("formats a 7-digit number correctly", () => {
        expect(formatPhoneNumber("628961554")).toBe("+62 896-1554");
    });

    it("handles numbers with less than 7 digits after country code", () => {
        expect(formatPhoneNumber("6289615")).toBe("+62 89615");
    });

    it("handles empty input", () => {
        expect(formatPhoneNumber("")).toBe("");
    });
    it("formats an 11-digit number correctly", () => {
        expect(formatPhoneNumber("6289615545511")).toBe("+62 896-1554-5511");
    });

    it("formats a 10-digit number correctly", () => {
        expect(formatPhoneNumber("62811101459")).toBe("+62 811-101-459");
    });

    it("formats a 9-digit number correctly", () => {
        expect(formatPhoneNumber("62896155455")).toBe("+62 896-155-455");
    });

    it("formats a 7-digit number correctly", () => {
        expect(formatPhoneNumber("628961554")).toBe("+62 896-1554");
    });

    it("handles numbers with less than 7 digits after country code", () => {
        expect(formatPhoneNumber("6289615")).toBe("+62 89615");
    });

    it("handles empty input", () => {
        expect(formatPhoneNumber("")).toBe("");
    });

    it("adds '62' to the beginning if not present", () => {
        expect(formatPhoneNumber("89615545511")).toBe("+62 896-1554-5511");
    });

    it("formats a 10-digit national number correctly", () => {
        expect(formatPhoneNumber("628123456789")).toBe("+62 812-345-6789");
    });
});
