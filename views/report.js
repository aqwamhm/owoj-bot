const { showFormattedDate } = require("../utils/date");
const { formatName } = require("../utils/name");

const reportViews = {
    success: {
        create({ name, pages, juz, type, startDate, endDate }) {
            return `Baarakallahu fiik, laporan berhasil dicatat: 
            
- *Nama:* ${formatName(name)}
- *Jumlah Halaman:* ${pages}
- *Juz:* ${juz}
- *Jenis:* ${formatName(type)} 
- *Periode:* ${showFormattedDate(startDate)} - ${showFormattedDate(endDate)}
`;
        },
        remove() {
            return `Laporan berhasil dihapus.`;
        },
    },
    error: {
        notFound() {
            return `Laporan tidak ditemukan.`;
        },
        conflict() {
            return `Jumlah laporan halaman harus lebih banyak dari jumlah halaman sebelumnya.`;
        },
    },
    validation: {
        format() {
            return `- /lapor <nama>#<jumlah halaman> -<jumlah periode sebelumnya (opsional)>
- /lapor <nama>#Terjemah -<jumlah periode sebelumnya (opsional)>
- /lapor <nama>#Murottal -<jumlah periode sebelumnya (opsional)>`;
        },
        example() {
            return `- /lapor Aqwam#20 (untuk periode saat ini)
- /lapor Aqwam#20 -1 (untuk satu periode sebelumnya)
- /lapor Ivo#Terjemah
- /lapor Ivo#Murottal`;
        },
    },
};

module.exports = reportViews;
