const { incrementJuz, decrementJuz } = require("../juz");

describe("Utils - incrementJuz", () => {
    it("should increment juz by 1", () => {
        expect(incrementJuz(5)).toBe(6);
    });

    it("should increment juz by a custom number", () => {
        expect(incrementJuz(5, 3)).toBe(8);
    });

    it("should wrap around to 1 when incrementing juz 30 by 1", () => {
        expect(incrementJuz(30)).toBe(1);
    });

    it("should wrap around correctly when incrementing and adding more than 30", () => {
        expect(incrementJuz(28, 5)).toBe(3);
    });

    it("should default to incrementing by 1 if no number is provided", () => {
        expect(incrementJuz(10)).toBe(11);
    });
});

describe("Utils - decrementJuz", () => {
    it("should decrement juz by 1", () => {
        expect(decrementJuz(5)).toBe(4);
    });

    it("should decrement juz by a custom number", () => {
        expect(decrementJuz(5, 2)).toBe(3);
    });

    it("should wrap around to 30 when decrementing juz 1 by 1", () => {
        expect(decrementJuz(1)).toBe(30);
    });

    it("should wrap around correctly when decrementing and going below 1", () => {
        expect(decrementJuz(3, 5)).toBe(28);
    });

    it("should default to decrementing by 1 if no number is provided", () => {
        expect(decrementJuz(10)).toBe(9);
    });
});
