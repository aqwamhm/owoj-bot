const memberServices = require("../services/member");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");
const { validate } = require("../validations/validators");
const validations = require("../validations");
const errorMessages = require("../views/error");
const NotFoundError = require("../exceptions/NotFoundError");
const ConflictError = require("../exceptions/ConflictError");
const reportViews = require("../views/report");

const handleCreateReport = async (message) => {
    const { name, pages, previousPeriods } = validate({
        command: message.body,
        validation: validations.createReportCommand,
        errorMessage: errorMessages.validation({
            format: "#lapor <nama>#<jumlah halaman> (-<jumlah minggu sebelumnya>)",
            example: "#lapor Aqwam#20 -1",
        }),
    });

    const groupId = message.id.remote;

    if (!(await memberServices.find({ name, groupId }))) {
        throw new NotFoundError(
            `Gagal mencatat laporan. Nama (${name}) tidak terdaftar di dalam grup ini.`
        );
    }

    const { startDate, endDate } = previousPeriods
        ? getPeriodDate(-Math.abs(previousPeriods))
        : getPeriodDate();

    let result;

    const previousReport = await reportServices.find({
        memberName: name,
        memberGroupId: groupId,
        periodStartDate: startDate,
        periodEndDate: endDate,
    });

    if (previousReport && previousReport.pages >= pages) {
        throw new ConflictError(reportViews.error.conflict());
    }

    if (!previousPeriods) {
        result = await memberServices.find({ name, groupId });
    } else {
        result = await reportServices.find({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
        });
    }

    const juz = !previousPeriods ? result.currentJuz : result.juz;

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

module.exports = { handleCreateReport };
