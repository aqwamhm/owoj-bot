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
        conflict({ name, pages, startDate, endDate }) {
            return `Laporan untuk ${name} dengan ${pages} halaman di periode ${startDate} - ${endDate} telah tercatat sebelumnya.`;
        },
    },
};

module.exports = reportViews;
