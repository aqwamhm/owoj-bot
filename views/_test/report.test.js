const reportViews = require("../report");
const { showFormattedDate } = require("../../utils/date");

describe("reportViews", () => {
    describe("success", () => {
        it("should return the correct message for create", () => {
            const startDate = new Date("2023-01-01");
            const endDate = new Date("2023-01-07");
            const result = reportViews.success.create({
                name: "John Doe",
                pages: "20",
                juz: "1",
                type: "TERJEMAH",
                startDate,
                endDate,
            });
            expect(result).toBe(
                `Baarakallahu fiik, laporan berhasil dicatat: \n            \n- *Nama:* John Doe\n- *Jumlah Halaman:* 20\n- *Juz:* 1\n- *Jenis:* Terjemah \n- *Periode:* ${showFormattedDate(
                    startDate
                )} - ${showFormattedDate(endDate)}\n`
            );
        });

        it("should return the correct message for remove", () => {
            const result = reportViews.success.remove();
            expect(result).toBe("Laporan berhasil dihapus.");
        });
    });

    describe("error", () => {
        it("should return the correct message for notFound", () => {
            const result = reportViews.error.notFound();
            expect(result).toBe("Laporan tidak ditemukan.");
        });

        it("should return the correct message for conflict", () => {
            const result = reportViews.error.conflictPages();
            expect(result).toBe(
                "Jumlah laporan halaman harus lebih banyak dari jumlah halaman sebelumnya."
            );
        });

        it("should return the correct message for conflictTotalPages", () => {
            const result = reportViews.error.conflictTotalPages();
            expect(result).toBe(
                "Jumlah halaman tidak boleh lebih besar dari total halaman."
            );
        });
    });

    describe("validation", () => {
        it("should return the correct message for format", () => {
            const result = reportViews.validation.format();
            expect(result).toBe(
                "- /lapor nama#jumlah halaman/total halaman\n- /lapor nama#jumlah halaman/total halaman#terjemah\n- /lapor nama#jumlah halaman/total halaman#murottal"
            );
        });

        it("should return the correct message for example", () => {
            const result = reportViews.validation.example();
            expect(result).toBe(
                "- /lapor Aqwam#20/20 (untuk periode saat ini)\n- /lapor Aqwam#20/20 -1 (untuk satu periode sebelumnya)\n- /lapor Apri#20/20 -2 (untuk dua periode sebelumnya)\n- /lapor Ivo#20/20#terjemah (untuk laporan terjemah)\n- /lapor Ivo#20/20#murottal (untuk laporan murottal)"
            );
        });
    });
});
