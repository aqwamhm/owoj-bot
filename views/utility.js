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
};

module.exports = utilityViews;
