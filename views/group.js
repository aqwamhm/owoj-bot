const groupViews = {
    success: {
        create({ nomor }) {
            return `OWOJ ${nomor} berhasil di daftarkan ke sistem.`;
        },
    },
    error: {
        notFound() {
            return `Grup ini tidak terdaftar sebagai OWOJ.`;
        },
        conflict({ nomor }) {
            return `OWOJ ${nomor} sudah terdaftar.`;
        },
    },
};

module.exports = groupViews;
