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
        conflictPages() {
            return `Jumlah laporan halaman harus lebih banyak dari jumlah halaman sebelumnya.`;
        },
        conflictTotalPages() {
            return `Jumlah halaman tidak boleh lebih besar dari total halaman.`;
        },
    },
    validation: {
        format() {
            return `- /lapor nama#jumlah halaman/total halaman
- /lapor nama#jumlah halaman/total halaman#terjemah
- /lapor nama#jumlah halaman/total halaman#murottal`;
        },
        example() {
            return `- /lapor Aqwam#20/20 (untuk periode saat ini)
- /lapor Aqwam#20/20 -1 (untuk satu periode sebelumnya)
- /lapor Apri#20/20 -2 (untuk dua periode sebelumnya)
- /lapor Ivo#20/20#terjemah (untuk laporan terjemah)
- /lapor Ivo#20/20#murottal (untuk laporan murottal)`;
        },
    },
};

module.exports = reportViews;
