const groupViews = {
    success: {
        create({ nomor }) {
            return `OWOJ ${nomor} berhasil di daftarkan ke sistem.`;
        },
    },
    error: {
        notFound() {
            return `Chat ini tidak terdaftar sebagai grup OWOJ.`;
        },
        conflict({ nomor }) {
            return `OWOJ ${nomor} sudah terdaftar.`;
        },
    },
};

module.exports = groupViews;
