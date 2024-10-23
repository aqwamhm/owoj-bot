const prisma = require("../config/db");
const ConflictError = require("../exceptions/ConflictError");
const { showFormattedDate } = require("../utils/hepler");

const reportServices = {
    async create({ name, groupId, juz, pages, startDate, endDate }) {
        if (
            await this.find({
                memberName: name,
                memberGroupId: groupId,
                pages,
                periodStartDate: startDate,
                periodEndDate: endDate,
            })
        ) {
            throw new ConflictError(
                `Gagal mencatat laporan. Laporan atas nama ${name} dengan 20 halaman untuk periode (${showFormattedDate(
                    startDate
                )} - ${showFormattedDate(endDate)}) telah tercatat sebelumnya.`
            );
        }

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
            ...(pages !== undefined && { pages }),
            ...(periodStartDate && { periodStartDate }),
            ...(periodEndDate && { periodEndDate }),
        };

        return await prisma.report.findFirst({
            where,
        });
    },
};

module.exports = reportServices;
