const { formatName } = require("../utils/name");

const groupViews = {
    success: {
        create({ number }) {
            return `OWOJ ${number} berhasil di daftarkan ke sistem.`;
        },
        remove({ number }) {
            return `OWOJ ${number} berhasil di hapus dari sistem.`;
        },
        setGroupAdmin({ name, number }) {
            return `Berhasil menetapkan admin ${formatName(
                name
            )} sebagai admin grup OWOJ ${number}.`;
        },
    },
    error: {
        notFound(number = null) {
            return `Chat ini tidak terdaftar sebagai grup OWOJ${
                number ? ` ${number}` : ""
            }.`;
        },
        conflict({ number }) {
            return `OWOJ ${number} sudah terdaftar.`;
        },
    },
};

module.exports = groupViews;
