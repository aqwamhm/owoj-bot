const groupViews = {
    success: {
        create({ number }) {
            return `OWOJ ${number} berhasil di daftarkan ke sistem.`;
        },
    },
    error: {
        notFound() {
            return `Chat ini tidak terdaftar sebagai grup OWOJ.`;
        },
        conflict({ number }) {
            return `OWOJ ${number} sudah terdaftar.`;
        },
    },
};

module.exports = groupViews;
