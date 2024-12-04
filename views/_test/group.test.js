const groupViews = require("../group");

describe("groupViews", () => {
    describe("success", () => {
        it("should return the correct message for create", () => {
            const result = groupViews.success.create({ number: "123" });
            expect(result).toBe("OWOJ 123 berhasil di daftarkan ke sistem.");
        });

        it("should return the correct message for remove", () => {
            const result = groupViews.success.remove({ number: "123" });
            expect(result).toBe("OWOJ 123 berhasil di hapus dari sistem.");
        });

        it("should return the correct message for setGroupAdmin", () => {
            const result = groupViews.success.setGroupAdmin({
                name: "Aqwam",
                number: "123",
            });
            expect(result).toBe(
                "Berhasil menetapkan admin Aqwam sebagai admin grup OWOJ 123."
            );
        });
    });

    describe("error", () => {
        it("should return the correct message for notFound", () => {
            const result = groupViews.error.notFound();
            expect(result).toBe("Chat ini tidak terdaftar sebagai grup OWOJ.");
        });

        it("should return the correct message for notFound with number", () => {
            const result = groupViews.error.notFound(1);
            expect(result).toBe(
                "Chat ini tidak terdaftar sebagai grup OWOJ 1."
            );
        });

        it("should return the correct message for conflict", () => {
            const result = groupViews.error.conflict({ number: "123" });
            expect(result).toBe("OWOJ 123 sudah terdaftar.");
        });
    });
});
