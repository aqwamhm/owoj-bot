const templateViews = require("../template");

describe("templateViews", () => {
    describe("doaKhatamQuran", () => {
        it("should return the correct doa khatam quran template", () => {
            const result = templateViews.doaKhatamQuran;
            expect(result).toContain("DOA KHATMIL QUR'AN");
            expect(result).toContain("اَللَّهُمَّ ارْحَمْنِا بِاْلقُرْآنْ");
            expect(result).toContain("Artinya:");
            expect(result).toContain(
                "Ya Allah rahmatilah kami dengan al Qur’an"
            );
        });
    });

    describe("pembukaan", () => {
        it("should return the correct pembukaan template", () => {
            const result = templateViews.pembukaan;
            expect(result).toContain(
                "Saudaraku semua, marilah kita buka kembali majelis tilawah yang penuh berkah ini dengan mengucapkan doa pembukaan:"
            );
            expect(result).toContain(
                "بِسْــــــــــــــــــــــمِ اللّهِ الرَّحْمَنِ الرَّحِيْم"
            );
            expect(result).toContain(
                "Yaa Allah, dengan Hak-Mu, Engkau menurunkan Al-Qur'an"
            );
        });
    });

    describe("oneDayReminder", () => {
        it("should return the correct one day reminder template", () => {
            const result = templateViews.oneDayReminder();
            expect(result).toContain(
                "*📢 Pengingat 24 Jam Menuju Periode Baru 📢*"
            );
            expect(result).toContain(
                "Assalamu’alaikum Warahmatullahi Wabarakatuh,"
            );
            expect(result).toContain(
                "Dalam waktu *24 jam lagi*, insyaAllah kita akan memasuki periode baru."
            );
        });
    });
});
