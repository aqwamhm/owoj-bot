const { formatName } = require("../utils/name");

const utilityViews = {
    motivation: {
        error: {
            request() {
                return "Terjadi kesalahan saat mengirim permintaan ke AI. Tapi nggak apa-apa, yang penting OWOJ harus tetap semangat ngajinya. 💪💪💪";
            },
        },
    },
    prayerTime: {
        success({ prayerTime }) {
            return `Waktu Sholat ${formatName(
                prayerTime.lokasi
            )} - ${prayerTime.jadwal.tanggal.replace("Minggu", "Ahad")}:

- *Imsak:* ${prayerTime.jadwal.imsak}
- *Subuh:* ${prayerTime.jadwal.subuh}
- *Terbit:* ${prayerTime.jadwal.terbit}
- *Dzuhur:* ${prayerTime.jadwal.dzuhur}
- *Ashar:* ${prayerTime.jadwal.ashar}
- *Maghrib:* ${prayerTime.jadwal.maghrib}
- *Isya:* ${prayerTime.jadwal.isya}`;
        },
        error: {
            locationNotFound() {
                return "Terjadi kesalahan saat mencari nama kota/kabupaten. Pastikan untuk menggunakan nama kota/kabupaten yang tepat.";
            },
        },
    },
    tafsir: {
        success({ tafsir, chapters }) {
            let result = "";

            tafsir.verses.forEach((verse) => {
                if (verse.verse == 1) {
                    result += `-----\n${
                        chapters.find((c) => c.id == verse.chapter).intro
                    }-----\n\n`;
                }

                result += `*${verse.chapter}:${verse.verse}*\n${verse.interpretation}\n\n`;
            });

            result += `-----\n${tafsir.benefits}`;

            return result;
        },
        error: {
            pageNotFound() {
                return "Halaman tidak tersedia, halaman yang tersedia adalah 1 sampai 604.";
            },
        },
    },
};

module.exports = utilityViews;
