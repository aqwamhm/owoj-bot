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

    async find({ memberName, memberGroupId, periodStartDate, periodEndDate }) {
        return await prisma.report.findFirst({
            where: {
                memberName,
                memberGroupId,
                periodStartDate,
                periodEndDate,
            },
        });
    },
};

module.exports = reportServices;
