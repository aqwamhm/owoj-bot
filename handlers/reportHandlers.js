const memberServices = require("../services/member");
const reportServices = require("../services/report");
const { getPeriodDate, showFormattedDate } = require("../utils/hepler");
const { validate } = require("../validations/validators");
const validations = require("../validations");
const errorMessages = require("../views/error");
const NotFoundError = require("../exceptions/NotFoundError");
const ConflictError = require("../exceptions/ConflictError");

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

    if (
        await reportServices.find({
            memberName: name,
            memberGroupId: groupId,
            pages,
            periodStartDate: startDate,
            periodEndDate: endDate,
        })
    ) {
        throw new ConflictError(
            `Gagal mencatat laporan. Laporan atas nama ${name} dengan ${pages} halaman untuk periode (${showFormattedDate(
                startDate
            )} - ${showFormattedDate(endDate)}) telah tercatat sebelumnya.`
        );
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

    message.reply(`Barakallahu fiik, laporan berhasil dicatat untuk ${name}.`);
};

module.exports = { handleCreateReport };
