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

const handleCreateReport = async (message, validation) => {
    const { name, pagesOrType, previousPeriods } = validate({
        command: message.body,
        validation,
        errorMessage: errorMessages.validation({
            format: reportViews.validation.format(),
            example: reportViews.validation.example(),
        }),
    });

    const groupId = message.id.remote;

    const member = await memberServices.find({ name, groupId });

    if (!member) {
        throw new NotFoundError(memberViews.error.notFound({ name }));
    }

    const { startDate, endDate } = previousPeriods
        ? getPeriodDate(-Math.abs(previousPeriods))
        : getPeriodDate();

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

    if (pagesOrType === "terjemah") {
        return await createTerjemahReport({
            name,
            groupId,
            juz,
            startDate,
            endDate,
        });
    } else if (pagesOrType === "murottal") {
        return await createMurottalReport({
            name,
            groupId,
            juz,
            startDate,
            endDate,
        });
    } else {
        return await createTilawahReport({
            name,
            groupId,
            pages: pagesOrType,
            juz,
            startDate,
            endDate,
        });
    }
};

const createTerjemahReport = async ({
    name,
    groupId,
    juz,
    startDate,
    endDate,
}) => {
    await reportServices.create({
        name,
        groupId,
        pages: 20,
        juz,
        type: "TERJEMAH",
        startDate,
        endDate,
    });

    return reportViews.success.create({
        name,
        pages: 20,
        juz,
        type: "TERJEMAH",
        startDate,
        endDate,
    });
};

const createMurottalReport = async ({
    name,
    groupId,
    juz,
    startDate,
    endDate,
}) => {
    await reportServices.create({
        name,
        groupId,
        pages: 20,
        juz,
        type: "MUROTTAL",
        startDate,
        endDate,
    });

    return reportViews.success.create({
        name,
        pages: 20,
        juz,
        type: "MUROTTAL",
        startDate,
        endDate,
    });
};

const createTilawahReport = async ({
    name,
    groupId,
    pages,
    juz,
    startDate,
    endDate,
}) => {
    const [finishedPages, totalPages] = pages.split("/");

    const previousReport = await reportServices.find({
        memberName: name,
        memberGroupId: groupId,
        periodStartDate: startDate,
        periodEndDate: endDate,
    });

    if (previousReport && previousReport.pages >= pages) {
        throw new ConflictError(reportViews.error.conflict());
    }

    await reportServices.create({
        name,
        groupId,
        pages: parseInt(finishedPages),
        totalPages: parseInt(totalPages),
        juz,
        type: "TILAWAH",
        startDate,
        endDate,
    });

    await reportServices.updateMany({
        memberName: name,
        memberGroupId: groupId,
        periodStartDate: startDate,
        periodEndDate: endDate,
        totalPages: parseInt(totalPages),
    });

    return reportViews.success.create({
        name,
        pages,
        juz,
        type: "TILAWAH",
        startDate,
        endDate,
    });
};

const handleRemoveReport = async (message, validation) => {
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
        type = "TILAWAH";
    }

    if (
        !(await reportServices.find({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
            pages,
            totalPages,
            type,
        }))
    ) {
        throw new NotFoundError(reportViews.error.notFound());
    }

    const allPeriodReports = await reportServices.findMany({
        memberName: name,
        memberGroupId: groupId,
        periodStartDate: startDate,
        periodEndDate: endDate,
    });

    if (allPeriodReports.length > 1) {
        await reportServices.delete({
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
        await reportServices.create({
            name,
            groupId,
            juz: firstPeriodReport.juz,
            pages: 0,
            totalPages: 0,
            type: "TILAWAH",
            startDate,
            endDate,
        });
        await reportServices.delete({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
            pages,
            totalPages,
            type,
        });
    }

    return reportViews.success.remove();
};

module.exports = { handleCreateReport, handleRemoveReport };
