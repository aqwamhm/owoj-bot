const { formatName } = require("../utils/name");

const memberViews = {
    success: {
        setJuz({ name, currentJuz }) {
            return `Data member berhasil diupdate, ${formatName(
                name
            )} akan membaca juz ${currentJuz}.`;
        },
        setName({ oldName, newName }) {
            return `Data member berhasil diupdate, Nama "${formatName(
                oldName
            )}" berhasil diubah menjadi "${formatName(newName)}".`;
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
            )}) tidak terdaftar di dalam grup ini. Pastikan nama yang Anda tulis sesuai dengan yang terdaftar di list. Jika nama yang terdaftar di list tidak tepat, silahkan hubungi admin grup untuk memperbaharui nama Anda.`;
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
