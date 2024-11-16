const { prisma } = require("../config/db");
const ConflictError = require("../exceptions/ConflictError");
const groupViews = require("../views/group");

const groupServices = {
    async create({ id, number }) {
        const group = await this.find({ id });

        if (group) {
            throw new ConflictError(
                groupViews.error.conflict({ nomor: group.number })
            );
        }

        await prisma.group.create({
            data: {
                id,
                number,
            },
        });
    },

    async find({ id }) {
        return await prisma.group.findUnique({
            where: {
                id,
            },
        });
    },

    async getAll() {
        return await prisma.group.findMany({
            orderBy: {
                number: "asc",
            },
            include: {
                _count: {
                    select: { members: true },
                },
            },
        });
    },
};

module.exports = groupServices;
