const motivationViews = require("../motivation");

describe("motivationViews", () => {
    describe("error", () => {
        it("should return the correct message for request", () => {
            const result = motivationViews.error.request();
            expect(result).toBe(
                "Terjadi kesalahan saat mengirim permintaan ke AI. Tapi nggak apa-apa, yang penting OWOJ harus tetap semangat ngajinya. 💪💪💪"
            );
        });
    });
});
