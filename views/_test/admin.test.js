const adminViews = require("../admin");

describe("adminViews", () => {
    describe("success", () => {
        it("should return the correct message for create", () => {
            const result = adminViews.success.create({
                name: "John Doe",
                phone: "1234567890",
            });
            expect(result).toBe(
                "Berhasil mendaftarkan admin John Doe dengan nomor telepon 1234567890."
            );
        });

        it("should return the correct message for remove", () => {
            const result = adminViews.success.remove({
                name: "John Doe",
                phone: "1234567890",
            });
            expect(result).toBe(
                "Berhasil menghapus admin John Doe dengan nomor telepon 1234567890."
            );
        });
    });

    describe("error", () => {
        it("should return the correct message for notFound", () => {
            const result = adminViews.error.notFound({ phone: "1234567890" });
            expect(result).toBe(
                "Nomor telepon 1234567890 tidak terdaftar sebagai admin."
            );
        });

        it("should return the correct message for conflict", () => {
            const result = adminViews.error.conflict({ phone: "1234567890" });
            expect(result).toBe(
                "Nomor telepon 1234567890 sudah terdaftar sebagai admin."
            );
        });

        it("should return the correct message for authentication", () => {
            const result = adminViews.error.authentication();
            expect(result).toBe("Password yang anda berikan salah.");
        });
    });
});
