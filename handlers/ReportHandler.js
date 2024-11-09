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
        const { name, pages, type, previousPeriods } = validate({
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

        const [finishedPages, totalPages] = pages.split("/").map(Number);

        if (finishedPages > totalPages) {
            throw new ConflictError(
                this.reportViews.error.conflictTotalPages()
            );
        }

        const previousReport = await this.reportServices.find({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
        });

        if (previousReport && previousReport.pages >= finishedPages) {
            throw new ConflictError(this.reportViews.error.conflictPages());
        }

        if (type === "terjemah") {
            return await this.createTerjemahReport({
                name,
                groupId,
                juz,
                startDate,
                endDate,
                finishedPages,
                totalPages,
            });
        } else if (type === "murottal") {
            return await this.createMurottalReport({
                name,
                groupId,
                juz,
                startDate,
                endDate,
                finishedPages,
                totalPages,
            });
        } else {
            return await this.createTilawahReport({
                name,
                groupId,
                pages,
                juz,
                startDate,
                endDate,
            });
        }
    }

    async createTerjemahReport({
        name,
        groupId,
        juz,
        startDate,
        endDate,
        finishedPages,
        totalPages,
    }) {
        await this.reportServices.create({
            name,
            groupId,
            pages: finishedPages,
            totalPages: totalPages,
            juz,
            type: "TERJEMAH",
            startDate,
            endDate,
        });

        await this.reportServices.updateMany({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
            totalPages,
            type: "TERJEMAH",
        });

        return this.reportViews.success.create({
            name,
            pages: `${finishedPages}/${totalPages}`,
            juz,
            type: "TERJEMAH",
            startDate,
            endDate,
        });
    }

    async createMurottalReport({
        name,
        groupId,
        juz,
        startDate,
        endDate,
        finishedPages,
        totalPages,
    }) {
        await this.reportServices.create({
            name,
            groupId,
            pages: finishedPages,
            totalPages: totalPages,
            juz,
            type: "MUROTTAL",
            startDate,
            endDate,
        });

        await this.reportServices.updateMany({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
            totalPages,
            type: "MUROTTAL",
        });

        return this.reportViews.success.create({
            name,
            pages: `${finishedPages}/${totalPages}`,
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
        const [finishedPages, totalPages] = pages.split("/").map(Number);

        await this.reportServices.create({
            name,
            groupId,
            pages: finishedPages,
            totalPages,
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
            totalPages,
            type: "TILAWAH",
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
        const { name, pages, type, previousPeriods } = validate({
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

        const [finishedPages, totalPages] = pages
            .split("/")
            .map((page) => parseInt(page.trim(), 10));

        // Determine the report type based on the 'type' field
        let reportType;
        if (type === "terjemah") {
            reportType = "TERJEMAH";
        } else if (type === "murottal") {
            reportType = "MUROTTAL";
        } else {
            reportType = "TILAWAH";
        }

        // Check if the specific report exists
        const existingReport = await this.reportServices.find({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
            pages: finishedPages,
            totalPages,
            type: reportType,
        });

        if (!existingReport) {
            throw new NotFoundError(this.reportViews.error.notFound());
        }

        // Retrieve all reports for the user in the same period
        const allPeriodReports = await this.reportServices.findMany({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
        });

        if (allPeriodReports.length > 1) {
            // Delete the specific report immediately if there are multiple reports
            await this.reportServices.delete({
                memberName: name,
                memberGroupId: groupId,
                periodStartDate: startDate,
                periodEndDate: endDate,
                pages: finishedPages,
                totalPages,
                type: reportType,
            });
        } else {
            // If it's the only report, reset the report to 0/0 with a default type "TILAWAH"
            const firstPeriodReport = allPeriodReports[0];

            // Create a new placeholder report to reset the user's progress
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

            // Delete the original report that the user requested to remove
            await this.reportServices.delete({
                memberName: name,
                memberGroupId: groupId,
                periodStartDate: startDate,
                periodEndDate: endDate,
                pages: finishedPages,
                totalPages,
                type: reportType,
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
