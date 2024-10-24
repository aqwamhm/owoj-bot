const memberViews = {
    success: {
        set({ name, currentJuz }) {
            return `Data ${name} berhasil diperbarui. Saat ini membaca juz ${currentJuz}.`;
        },
        register({ name, currentJuz }) {
            return `${name} berhasil didaftarkan ke dalam grup ini dan akan membaca juz ${currentJuz}.`;
        },
        remove({ name }) {
            return `Data ${name} berhasil dihapus dari grup.`;
        },
    },
    error: {
        notFound({ name }) {
            return `Nama (${name}) sudah terdaftar di dalam grup ini.`;
        },
        juzConflict({ name, currentJuz }) {
            return `${name} saat ini sedang membaca juz ${currentJuz}.`;
        },
        nameConflict({ name }) {
            return `${name} sudah terdaftar sebagai anggota grup.`;
        },
    },
};

module.exports = memberViews;
