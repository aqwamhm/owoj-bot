const memberServices = require("../services/member");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");
const { validate } = require("../utils/validator");

const errorMessages = require("../views/error");
const NotFoundError = require("../exceptions/NotFoundError");
const ConflictError = require("../exceptions/ConflictError");
const reportViews = require("../views/report");
const memberViews = require("../views/member");
const { decrementJuz } = require("../utils/juz");

class ReportHandler {
    constructor(reportServices, memberServices, reportViews, memberViews) {
        this.reportServices = reportServices;
        this.memberServices = memberServices;
        this.reportViews = reportViews;
        this.memberViews = memberViews;
    }

    async handleCreateReport(message, validation) {
        const { name, pagesOrType, previousPeriods } = validate({
            command: message.body,
            validation,
            errorMessage: errorMessages.validation({
                format: reportViews.validation.format(),
                example: reportViews.validation.example(),
            }),
        });

        const groupId = message.id.remote;

        const member = await this.memberServices.find({ name, groupId });

        if (!member) {
            throw new NotFoundError(this.memberViews.error.notFound({ name }));
        }

        const { startDate, endDate } = previousPeriods
            ? getPeriodDate(-Math.abs(previousPeriods))
            : getPeriodDate();

        let juz;
        if (previousPeriods) {
            const report = await this.reportServices.find({
                memberName: name,
                memberGroupId: groupId,
                periodStartDate: startDate,
                periodEndDate: endDate,
            });

            juz = !report
                ? decrementJuz(member.currentJuz, previousPeriods)
                : report.juz;
        } else {
            juz = member.currentJuz;
        }

        if (pagesOrType === "terjemah") {
            return await this.createTerjemahReport({
                name,
                groupId,
                juz,
                startDate,
                endDate,
            });
        } else if (pagesOrType === "murottal") {
            return await this.createMurottalReport({
                name,
                groupId,
                juz,
                startDate,
                endDate,
            });
        } else {
            return await this.createTilawahReport({
                name,
                groupId,
                pages: pagesOrType,
                juz,
                startDate,
                endDate,
            });
        }
    }

    async createTerjemahReport({ name, groupId, juz, startDate, endDate }) {
        await this.reportServices.create({
            name,
            groupId,
            pages: 20,
            juz,
            type: "TERJEMAH",
            startDate,
            endDate,
        });

        return this.reportViews.success.create({
            name,
            pages: 20,
            juz,
            type: "TERJEMAH",
            startDate,
            endDate,
        });
    }

    async createMurottalReport({ name, groupId, juz, startDate, endDate }) {
        await this.reportServices.create({
            name,
            groupId,
            pages: 20,
            juz,
            type: "MUROTTAL",
            startDate,
            endDate,
        });

        return this.reportViews.success.create({
            name,
            pages: 20,
            juz,
            type: "MUROTTAL",
            startDate,
            endDate,
        });
    }

    async createTilawahReport({
        name,
        groupId,
        pages,
        juz,
        startDate,
        endDate,
    }) {
        const [finishedPages, totalPages] = pages.split("/");

        const previousReport = await this.reportServices.find({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
        });

        if (previousReport && previousReport.pages >= finishedPages) {
            throw new ConflictError(this.reportViews.error.conflict());
        }

        await this.reportServices.create({
            name,
            groupId,
            pages: parseInt(finishedPages),
            totalPages: parseInt(totalPages),
            juz,
            type: "TILAWAH",
            startDate,
            endDate,
        });

        await this.reportServices.updateMany({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
            totalPages: parseInt(totalPages),
        });

        return this.reportViews.success.create({
            name,
            pages,
            juz,
            type: "TILAWAH",
            startDate,
            endDate,
        });
    }

    async handleRemoveReport(message, validation) {
        const { name, pagesOrType, previousPeriods } = validate({
            command: message.body,
            validation,
            errorMessage: errorMessages.validation({
                format: "/batal-lapor <nama>#halaman -<jumlah minggu sebelumnya jika ada>",
                example: "/batal-lapor Aqwam#halaman -1",
            }),
        });

        const groupId = message.id.remote;

        const { startDate, endDate } = previousPeriods
            ? getPeriodDate(-Math.abs(previousPeriods))
            : getPeriodDate();

        let pages, totalPages, type;

        if (pagesOrType === "terjemah") {
            pages = 20;
            totalPages = 20;
            type = "TERJEMAH";
        } else if (pagesOrType === "murottal") {
            pages = 20;
            totalPages = 20;
            type = "MUROTTAL";
        } else {
            [pages, totalPages] = pagesOrType.split("/");
            pages = parseInt(pages);
            totalPages = parseInt(totalPages);
            type = "TILAWAH";
        }

        if (
            !(await this.reportServices.find({
                memberName: name,
                memberGroupId: groupId,
                periodStartDate: startDate,
                periodEndDate: endDate,
                pages,
                totalPages,
                type,
            }))
        ) {
            throw new NotFoundError(this.reportViews.error.notFound());
        }

        const allPeriodReports = await this.reportServices.findMany({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
        });

        if (allPeriodReports.length > 1) {
            await this.reportServices.delete({
                memberName: name,
                memberGroupId: groupId,
                periodStartDate: startDate,
                periodEndDate: endDate,
                pages,
                totalPages,
                type,
            });
        } else {
            const firstPeriodReport = allPeriodReports[0];
            await this.reportServices.create({
                name,
                groupId,
                juz: firstPeriodReport.juz,
                pages: 0,
                totalPages: 0,
                type: "TILAWAH",
                startDate,
                endDate,
            });
            await this.reportServices.delete({
                memberName: name,
                memberGroupId: groupId,
                periodStartDate: startDate,
                periodEndDate: endDate,
                pages,
                totalPages,
                type,
            });
        }

        return this.reportViews.success.remove();
    }
}

module.exports = new ReportHandler(
    reportServices,
    memberServices,
    reportViews,
    memberViews
);
