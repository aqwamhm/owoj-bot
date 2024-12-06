const { prisma } = require("../config/db");

const periodServices = {
    async find({ startDate, endDate }) {
        return await prisma.period.findFirst({
            where: {
                startDate,
                endDate,
            },
        });
    },

    async create({ startDate, endDate }) {
        await prisma.period.create({
            data: {
                startDate,
                endDate,
            },
        });
    },

    async getAll() {
        return await prisma.period.findMany({
            orderBy: {
                startDate: "desc",
            },
            select: {
                startDate: true,
                endDate: true,
            },
        });
    },
};

module.exports = periodServices;
