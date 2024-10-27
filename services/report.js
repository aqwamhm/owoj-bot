const prisma = require("../config/db");

const reportServices = {
    async create({ name, groupId, juz, pages, startDate, endDate }) {
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
                juz,
                pages,
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

    async find({
        memberName,
        memberGroupId,
        pages,
        periodStartDate,
        periodEndDate,
    }) {
        const where = {
            memberName,
            memberGroupId,
            ...(pages !== undefined && { pages: parseInt(pages) }),
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
    }) {
        const where = {
            ...(memberName && { memberName }),
            ...(memberGroupId && { memberGroupId }),
            ...(periodStartDate && { periodStartDate }),
            ...(periodEndDate && { periodEndDate }),
            ...(pages && { pages: parseInt(pages) }),
        };

        return await prisma.report.delete({
            where: {
                memberName_memberGroupId_pages_periodStartDate_periodEndDate: {
                    ...where,
                },
            },
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
