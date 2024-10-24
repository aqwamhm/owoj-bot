const groupViews = {
    success: {
        create({ nomor }) {
            return `OWOJ ${nomor} berhasil di daftarkan ke sistem.`;
        },
    },
    error: {
        notFound({ nomor }) {
            return `Nomor grup ${nomor} tidak terdaftar.`;
        },
        conflict({ nomor }) {
            return `OWOJ ${nomor} sudah terdaftar.`;
        },
    },
};

module.exports = groupViews;
