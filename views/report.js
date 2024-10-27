const { showFormattedDate } = require("../utils/date");
const { formatName } = require("../utils/name");

const reportViews = {
    success: {
        create({ name, pages, startDate, endDate }) {
            return `Baarakallahu fiik, laporan berhasil dicatat: 
            
Nama: ${formatName(name)}
Halaman: ${pages}
Periode: ${showFormattedDate(startDate)} - ${showFormattedDate(endDate)}
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
};

module.exports = reportViews;
