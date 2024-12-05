const { numberToEmoji } = require("../number");

describe("numberToEmoji", () => {
    it("should convert positive integer to emoji", () => {
        expect(numberToEmoji(123)).toBe("1️⃣2️⃣3️⃣");
    });

    it("should convert negative integer to emoji", () => {
        expect(numberToEmoji(-456)).toBe("➖4️⃣5️⃣6️⃣");
    });

    it("should return empty string for non-integer input", () => {
        expect(numberToEmoji(78.9)).toBe("");
    });

    it("should return empty string for non-numeric input", () => {
        expect(numberToEmoji("abc")).toBe("");
    });

    it("should convert zero to emoji", () => {
        expect(numberToEmoji(0)).toBe("0️⃣");
    });

    it("should convert negative zero to emoji", () => {
        expect(numberToEmoji(-0)).toBe("0️⃣");
    });

    it("should convert large integer to emoji", () => {
        const largeNumber = 1234567890;
        const expectedEmoji = "1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣0️⃣";
        expect(numberToEmoji(largeNumber)).toBe(expectedEmoji);
    });

    it("should convert positive integer string to emoji", () => {
        expect(numberToEmoji("123")).toBe("1️⃣2️⃣3️⃣");
    });

    it("should convert negative integer string to emoji", () => {
        expect(numberToEmoji("-456")).toBe("➖4️⃣5️⃣6️⃣");
    });

    it("should convert zero string to emoji", () => {
        expect(numberToEmoji("0")).toBe("0️⃣");
    });

    it("should convert negative zero string to emoji", () => {
        expect(numberToEmoji("-0")).toBe("➖0️⃣");
    });

    it("should handle string with leading zeros", () => {
        expect(numberToEmoji("0123")).toBe("0️⃣1️⃣2️⃣3️⃣");
    });

    it("should handle empty string", () => {
        expect(numberToEmoji("")).toBe("");
    });

    it("should handle single digit string", () => {
        expect(numberToEmoji("5")).toBe("5️⃣");
    });

    it("should handle string with only minus sign", () => {
        expect(numberToEmoji("-")).toBe("");
    });

    it("should handle null input", () => {
        expect(numberToEmoji(null)).toBe("");
    });

    it("should handle undefined input", () => {
        expect(numberToEmoji(undefined)).toBe("");
    });

    it("should handle boolean inputs", () => {
        expect(numberToEmoji(true)).toBe("");
        expect(numberToEmoji(false)).toBe("");
    });
});
