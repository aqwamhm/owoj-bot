const { showFormattedDate } = require("../utils/hepler");

const reportViews = {
    success: {
        create({ name, pages, startDate, endDate }) {
            return `Baarakallahu fiik, laporan berhasil dicatat: 
            
Nama: ${name}
Halaman: ${pages}
Periode: ${showFormattedDate(startDate)} - ${showFormattedDate(endDate)}
            `;
        },
    },
    error: {
        notFound({ name }) {
            return `Nama ${name} tidak terdaftar di dalam grup.`;
        },
        conflict() {
            return `Jumlah laporan halaman harus lebih banyak dari jumlah halaman sebelumnya.`;
        },
    },
};

module.exports = reportViews;
