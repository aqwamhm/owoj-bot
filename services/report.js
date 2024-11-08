const { prisma } = require("../config/db");

const reportServices = {
    async create({
        name,
        groupId,
        juz,
        pages,
        totalPages,
        type,
        startDate,
        endDate,
    }) {
        type = type || "TILAWAH";
        pages = pages || 0;
        totalPages = totalPages || 0;

        return await prisma.report.upsert({
            where: {
                memberName_memberGroupId_pages_totalPages_type_periodStartDate_periodEndDate:
                    {
                        memberName: name,
                        memberGroupId: groupId,
                        pages: 0,
                        totalPages: 0,
                        type,
                        periodStartDate: startDate,
                        periodEndDate: endDate,
                    },
            },
            create: {
                member: {
                    connect: {
                        name_groupId: {
                            name,
                            groupId,
                        },
                    },
                },
                juz: parseInt(juz),
                pages: parseInt(pages),
                totalPages: parseInt(totalPages),
                type,
                period: {
                    connectOrCreate: {
                        where: {
                            startDate_endDate: {
                                startDate,
                                endDate,
                            },
                        },
                        create: {
                            startDate,
                            endDate,
                        },
                    },
                },
            },
            update: {
                member: {
                    connect: {
                        name_groupId: {
                            name,
                            groupId,
                        },
                    },
                },
                juz: parseInt(juz),
                pages: parseInt(pages),
                totalPages: parseInt(totalPages),
                type,
                period: {
                    connectOrCreate: {
                        where: {
                            startDate_endDate: {
                                startDate,
                                endDate,
                            },
                        },
                        create: {
                            startDate,
                            endDate,
                        },
                    },
                },
            },
        });
    },

    async createMany({ members, pages = 0, startDate, endDate }) {
        return await prisma.report.createMany({
            data: members.map((member) => ({
                memberName: member.name,
                memberGroupId: member.groupId,
                juz: member.currentJuz,
                pages,
                periodStartDate: startDate,
                periodEndDate: endDate,
            })),
            skipDuplicates: true,
        });
    },

    async findMany({
        memberName,
        memberGroupId,
        pages,
        totalPages,
        type,
        periodStartDate,
        periodEndDate,
    }) {
        const where = {
            memberName,
            memberGroupId,
            ...(pages !== undefined && { pages: parseInt(pages) }),
            ...(totalPages !== undefined && {
                totalPages: parseInt(totalPages),
            }),
            ...(type && { type }),
            ...(periodStartDate && { periodStartDate }),
            ...(periodEndDate && { periodEndDate }),
        };

        return await prisma.report.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async find({
        memberName,
        memberGroupId,
        pages,
        totalPages,
        type,
        periodStartDate,
        periodEndDate,
    }) {
        const where = {
            memberName,
            memberGroupId,
            ...(pages !== undefined && { pages: parseInt(pages) }),
            ...(totalPages !== undefined && {
                totalPages: parseInt(totalPages),
            }),
            ...(type && { type }),
            ...(periodStartDate && { periodStartDate }),
            ...(periodEndDate && { periodEndDate }),
        };

        return await prisma.report.findFirst({
            where,
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async delete({
        memberName,
        memberGroupId,
        periodStartDate,
        periodEndDate,
        pages,
        totalPages,
        type,
    }) {
        return await prisma.report.delete({
            where: {
                memberName_memberGroupId_pages_totalPages_type_periodStartDate_periodEndDate:
                    {
                        memberName,
                        memberGroupId,
                        pages: parseInt(pages),
                        totalPages: parseInt(totalPages),
                        type,
                        periodStartDate,
                        periodEndDate,
                    },
            },
        });
    },

    async deleteMany({
        memberName,
        memberGroupId,
        periodStartDate,
        periodEndDate,
    }) {
        const where = {
            ...(memberName && { memberName }),
            ...(memberGroupId && { memberGroupId }),
            ...(periodStartDate && { periodStartDate }),
            ...(periodEndDate && { periodEndDate }),
        };

        await prisma.report.deleteMany({
            where,
        });
    },

    async updateMany({
        memberName,
        memberGroupId,
        periodStartDate,
        periodEndDate,
        juz,
        totalPages,
    }) {
        const where = {
            ...(memberName && { memberName }),
            ...(memberGroupId && { memberGroupId }),
            ...(periodStartDate && { periodStartDate }),
            ...(periodEndDate && { periodEndDate }),
        };

        const data = {
            ...(juz && { juz: parseInt(juz) }),
            ...(totalPages && { totalPages: parseInt(totalPages) }),
        };

        await prisma.report.updateMany({
            where,
            data,
        });
    },
};

module.exports = reportServices;
