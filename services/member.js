const prisma = require("../config/db");

const memberServices = {
    async set({ name, groupId, currentJuz }) {
        await prisma.member.update({
            where: {
                name_groupId: {
                    name,
                    groupId,
                },
            },
            data: {
                name,
                currentJuz: parseInt(currentJuz),
            },
        });
    },

    async create({ name, groupId, currentJuz }) {
        await prisma.member.create({
            data: {
                name,
                groupId,
                currentJuz: parseInt(currentJuz),
            },
        });
    },

    async find({ name, groupId, currentJuz }) {
        const where = {
            ...(name && { name }),
            ...(groupId && { groupId }),
            ...(currentJuz && { currentJuz: parseInt(currentJuz) }),
        };

        return await prisma.member.findFirst({
            where,
        });
    },

    async getMembersByGroup(groupId) {
        return await prisma.member.findMany({
            where: {
                groupId: groupId,
            },
            select: {
                name: true,
                currentJuz: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    },

    async getWithReports({ groupId }) {
        return await prisma.member.findMany({
            where: {
                groupId: groupId,
            },
            select: {
                name: true,
                currentJuz: true,
                reports: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    },
};

module.exports = memberServices;
