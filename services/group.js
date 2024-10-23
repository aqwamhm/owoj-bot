const prisma = require("../config/db");

const groupServices = {
    async create({ id, number }) {
        await prisma.group.create({
            data: {
                id,
                number,
            },
        });
    },
};

module.exports = groupServices;
