const memberViews = require("../member");

describe("memberViews", () => {
    describe("success", () => {
        it("should return the correct message for set", () => {
            const result = memberViews.success.set({
                name: "John Doe",
                currentJuz: "1",
            });
            expect(result).toBe(
                "Data John Doe berhasil diperbarui. Saat ini membaca juz 1."
            );
        });

        it("should return the correct message for register", () => {
            const result = memberViews.success.register({
                name: "John Doe",
                currentJuz: "1",
            });
            expect(result).toBe(
                "John Doe berhasil didaftarkan ke dalam grup ini dan akan membaca juz 1."
            );
        });

        it("should return the correct message for remove", () => {
            const result = memberViews.success.remove({ name: "John Doe" });
            expect(result).toBe("Data John Doe berhasil dihapus dari grup.");
        });
    });

    describe("error", () => {
        it("should return the correct message for notFound", () => {
            const result = memberViews.error.notFound({ name: "John Doe" });
            expect(result).toBe(
                "Nama (John Doe) tidak terdaftar di dalam grup ini."
            );
        });

        it("should return the correct message for juzConflict", () => {
            const result = memberViews.error.juzConflict({
                name: "John Doe",
                currentJuz: "1",
            });
            expect(result).toBe("John Doe saat ini sedang membaca juz 1.");
        });

        it("should return the correct message for nameConflict", () => {
            const result = memberViews.error.nameConflict({ name: "John Doe" });
            expect(result).toBe(
                "John Doe sudah terdaftar sebagai anggota grup."
            );
        });
    });
});