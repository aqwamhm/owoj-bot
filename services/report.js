const prisma = require("../config/db");

const reportServices = {
    async create({ name, groupId, juz, pages, type, startDate, endDate }) {
        return await prisma.report.create({
            data: {
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

    async find({
        memberName,
        memberGroupId,
        pages,
        type,
        periodStartDate,
        periodEndDate,
    }) {
        const where = {
            memberName,
            memberGroupId,
            ...(pages !== undefined && { pages: parseInt(pages) }),
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
        type,
    }) {
        const where = {
            ...(memberName && { memberName }),
            ...(memberGroupId && { memberGroupId }),
            ...(periodStartDate && { periodStartDate }),
            ...(periodEndDate && { periodEndDate }),
            ...(pages && { pages: parseInt(pages) }),
            ...(type && { type }),
        };

        return await prisma.report.delete({
            where: {
                memberName_memberGroupId_pages_type_periodStartDate_periodEndDate:
                    {
                        ...where,
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
    }) {
        const where = {
            ...(memberName && { memberName }),
            ...(memberGroupId && { memberGroupId }),
            ...(periodStartDate && { periodStartDate }),
            ...(periodEndDate && { periodEndDate }),
        };

        await prisma.report.updateMany({
            where,
            data: {
                juz: parseInt(juz),
            },
        });
    },
};

module.exports = reportServices;
