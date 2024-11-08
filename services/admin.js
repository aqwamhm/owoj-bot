const { prisma } = require("../config/db");

const adminServices = {
    async create({ phoneNumber, name }) {
        await prisma.admin.create({
            data: {
                phoneNumber,
                name,
            },
        });
    },

    async remove({ phoneNumber }) {
        await prisma.admin.delete({
            where: {
                phoneNumber,
            },
        });
    },

    async find({ phoneNumber }) {
        return await prisma.admin.findFirst({
            where: {
                phoneNumber,
            },
        });
    },
};

module.exports = adminServices;
