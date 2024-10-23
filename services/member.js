const prisma = require("../config/db");

const memberServices = {
    async set({ name, groupId, currentJuz }) {
        await prisma.member.upsert({
            where: {
                name_groupId: {
                    name,
                    groupId,
                },
            },
            create: {
                name,
                currentJuz,
                groupId,
            },
            update: {
                name,
                currentJuz,
                groupId,
            },
        });
    },

    async find({ name, groupId }) {
        return await prisma.member.findUnique({
            where: {
                name_groupId: {
                    name,
                    groupId,
                },
            },
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
