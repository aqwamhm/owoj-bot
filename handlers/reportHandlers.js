const memberServices = require("../services/member");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");
const { validate } = require("../validations/validators");
const validations = require("../validations");
const errorMessages = require("../views/error");
const NotFoundError = require("../exceptions/NotFoundError");
const ConflictError = require("../exceptions/ConflictError");
const reportViews = require("../views/report");
const memberViews = require("../views/member");
const { decrementJuz } = require("../utils/juz");

const handleCreateReport = async (message) => {
    const { name, pages, previousPeriods } = validate({
        command: message.body,
        validation: validations.createReportCommand,
        errorMessage: errorMessages.validation({
            format: "/lapor <nama>#<jumlah halaman> -<jumlah minggu sebelumnya jika ada>",
            example: "/lapor Aqwam#20 -1",
        }),
    });

    const groupId = message.id.remote;

    if (!(await memberServices.find({ name, groupId }))) {
        throw new NotFoundError(memberViews.error.notFound({ name }));
    }

    const { startDate, endDate } = previousPeriods
        ? getPeriodDate(-Math.abs(previousPeriods))
        : getPeriodDate();

    const previousReport = await reportServices.find({
        memberName: name,
        memberGroupId: groupId,
        periodStartDate: startDate,
        periodEndDate: endDate,
    });

    if (previousReport && previousReport.pages >= pages) {
        throw new ConflictError(reportViews.error.conflict());
    }

    const member = await memberServices.find({ name, groupId });
    const report = await reportServices.find({
        memberName: name,
        memberGroupId: groupId,
        periodStartDate: startDate,
        periodEndDate: endDate,
    });

    let juz;
    if (previousPeriods) {
        juz = !report
            ? decrementJuz(member.currentJuz, previousPeriods)
            : report.juz;
    } else {
        juz = member.currentJuz;
    }

    await reportServices.create({
        name,
        groupId,
        juz,
        pages: parseInt(pages),
        startDate,
        endDate,
    });

    return reportViews.success.create({
        name,
        pages,
        startDate,
        endDate,
    });
};

const handleRemoveReport = async (message) => {
    const { name, pages, previousPeriods } = validate({
        command: message.body,
        validation: validations.removeReportCommand,
        errorMessage: errorMessages.validation({
            format: "/batal-lapor <nama>#halaman -<jumlah minggu sebelumnya jika ada>",
            example: "/batal-lapor Aqwam#halaman -1",
        }),
    });

    const groupId = message.id.remote;

    const { startDate, endDate } = previousPeriods
        ? getPeriodDate(-Math.abs(previousPeriods))
        : getPeriodDate();

    if (
        !(await reportServices.find({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
            pages,
        }))
    ) {
        throw new NotFoundError(reportViews.error.notFound());
    }

    await reportServices.delete({
        memberName: name,
        memberGroupId: groupId,
        periodStartDate: startDate,
        periodEndDate: endDate,
        pages,
    });

    return reportViews.success.remove();
};

module.exports = { handleCreateReport, handleRemoveReport };
