const { formatName } = require("../utils/name");

const adminViews = {
    success: {
        create({ name, phone }) {
            return `Berhasil mendaftarkan admin ${formatName(
                name
            )} dengan nomor telepon ${phone}.`;
        },
        remove({ name, phone }) {
            return `Berhasil menghapus admin ${name} dengan nomor telepon ${phone}.`;
        },
    },
    error: {
        notFound({ phone }) {
            return `Nomor telepon ${phone} tidak terdaftar sebagai admin.`;
        },
        conflict({ phone }) {
            return `Nomor telepon ${phone} sudah terdaftar sebagai admin.`;
        },
        authentication() {
            return `Password yang anda berikan salah.`;
        },
    },
};

module.exports = adminViews;
