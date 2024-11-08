const groupViews = require("../group");

describe("groupViews", () => {
    describe("success", () => {
        it("should return the correct message for create", () => {
            const result = groupViews.success.create({ number: "123" });
            expect(result).toBe("OWOJ 123 berhasil di daftarkan ke sistem.");
        });
    });

    describe("error", () => {
        it("should return the correct message for notFound", () => {
            const result = groupViews.error.notFound();
            expect(result).toBe("Chat ini tidak terdaftar sebagai grup OWOJ.");
        });

        it("should return the correct message for conflict", () => {
            const result = groupViews.error.conflict({ number: "123" });
            expect(result).toBe("OWOJ 123 sudah terdaftar.");
        });
    });
});
