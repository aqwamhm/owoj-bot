const { formatName } = require("../utils/name");

const memberViews = {
    success: {
        set({ name, currentJuz }) {
            return `Data ${formatName(
                name
            )} berhasil diperbarui. Saat ini membaca juz ${currentJuz}.`;
        },
        register({ name, currentJuz }) {
            return `${formatName(
                name
            )} berhasil didaftarkan ke dalam grup ini dan akan membaca juz ${currentJuz}.`;
        },
        remove({ name }) {
            return `Data ${formatName(name)} berhasil dihapus dari grup.`;
        },
    },
    error: {
        notFound({ name }) {
            return `Nama (${formatName(
                name
            )}) sudah terdaftar di dalam grup ini.`;
        },
        juzConflict({ name, currentJuz }) {
            return `${formatName(
                name
            )} saat ini sedang membaca juz ${currentJuz}.`;
        },
        nameConflict({ name }) {
            return `${formatName(name)} sudah terdaftar sebagai anggota grup.`;
        },
    },
};

module.exports = memberViews;
