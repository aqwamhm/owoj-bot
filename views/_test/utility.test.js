const utilityViews = require("../utility");

describe("utilityViews", () => {
    describe("motivation", () => {
        describe("error", () => {
            it("should return the correct message for request", () => {
                const result = utilityViews.motivation.error.request();
                expect(result).toBe(
                    "Terjadi kesalahan saat mengirim permintaan ke AI. Tapi nggak apa-apa, yang penting OWOJ harus tetap semangat ngajinya. 💪💪💪"
                );
            });
        });
    });

    describe("prayerTime", () => {
        describe("success", () => {
            it("should format the prayer times correctly", () => {
                const mockPrayerTime = {
                    lokasi: "Jakarta",
                    jadwal: {
                        tanggal: "Minggu, 17 November 2024",
                        imsak: "04:30",
                        subuh: "04:45",
                        terbit: "05:55",
                        dzuhur: "12:00",
                        ashar: "15:15",
                        maghrib: "18:00",
                        isya: "19:15",
                    },
                };
                const result = utilityViews.prayerTime.success({
                    prayerTime: mockPrayerTime,
                });
                expect(result).toBe(
                    `Waktu Sholat Jakarta - Ahad, 17 November 2024:

- *Imsak:* 04:30
- *Subuh:* 04:45
- *Terbit:* 05:55
- *Dzuhur:* 12:00
- *Ashar:* 15:15
- *Maghrib:* 18:00
- *Isya:* 19:15`
                );
            });
        });

        describe("error", () => {
            it("should return the correct message when location is not found", () => {
                const result = utilityViews.prayerTime.error.locationNotFound();
                expect(result).toBe(
                    "Terjadi kesalahan saat mencari nama kota/kabupaten. Pastikan untuk menggunakan nama kota/kabupaten yang tepat."
                );
            });
        });
    });

    describe("tafsir", () => {
        describe("success", () => {
            it("should format the tafsir content correctly", () => {
                const mockTafsir = {
                    verses: [
                        {
                            chapter: 1,
                            verse: 1,
                            interpretation: "Interpretation of verse 1:1",
                        },
                        {
                            chapter: 1,
                            verse: 2,
                            interpretation: "Interpretation of verse 1:2",
                        },
                    ],
                    benefits: "Benefits of reading this tafsir",
                };
                const mockChapters = [
                    {
                        id: 1,
                        intro: "Introduction to Chapter 1",
                    },
                ];
                const result = utilityViews.tafsir.success({
                    tafsir: mockTafsir,
                    chapters: mockChapters,
                });
                expect(result).toBe(
                    `-----
Introduction to Chapter 1-----

*1:1*
Interpretation of verse 1:1

*1:2*
Interpretation of verse 1:2

-----
Benefits of reading this tafsir`
                );
            });
        });

        describe("error", () => {
            it("should return the correct message when page is not found", () => {
                const result = utilityViews.tafsir.error.pageNotFound();
                expect(result).toBe(
                    "Halaman tidak tersedia, halaman yang tersedia adalah 1 sampai 604."
                );
            });
        });
    });
});
