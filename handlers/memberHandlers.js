const ConflictError = require("../exceptions/ConflictError");
const NotFoundError = require("../exceptions/NotFoundError");
const memberServices = require("../services/member");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/hepler");
const validations = require("../validations");
const { validate } = require("../validations/validators");
const errorMessages = require("../views/error");

const handleSetMember = async (message) => {
    const { juz, name } = validate({
        command: message.body,
        validation: validations.setMemberCommand,
        errorMessage: errorMessages.validation({
            format: "#set <juz#nama>",
            example: "#set 12#Aqwam",
        }),
    });
    const groupId = message.id.remote;
    const { startDate, endDate } = getPeriodDate();

    if (!(await memberServices.find({ groupId, name }))) {
        throw new NotFoundError(
            `Gagal memperbarui data member. Nama (${name}) tidak terdataftar di dalam grup ini.`
        );
    }

    const memberJuzConflict = await memberServices.find({
        groupId,
        currentJuz: juz,
    });
    if (memberJuzConflict) {
        throw new ConflictError(
            `Gagal memperbarui data member. ${memberJuzConflict.name} saat ini sedang membaca juz ${memberJuzConflict.currentJuz}.`
        );
    }

    await reportServices.updateMany({
        memberName: name,
        memberGroupId: groupId,
        periodStartDate: startDate,
        periodEndDate: endDate,
        juz,
    });

    await memberServices.set({
        name,
        currentJuz: juz,
        groupId,
    });

    message.reply(`Data ${name} berhasil diperbarui.`);
};

const handleRegisterMember = async (message) => {
    let result = [];

    const members = validate({
        command: message.body,
        validation: validations.registerMemberCommand,
        errorMessage: errorMessages.validation({
            format: "#register <juz>#<nama>",
            example: "#register 1#Aqwam 2#John Doe 3#Maria",
        }),
    });

    const groupId = message.id.remote;

    for (const { name, juz: currentJuz } of members) {
        if (await memberServices.find({ groupId, name })) {
            result.push(
                `Gagal mendaftarkan member ${name}. Nama (${name}) sudah terdaftar di dalam grup ini.`
            );
            continue;
        }

        const memberJuzConflict = await memberServices.find({
            groupId,
            currentJuz,
        });
        if (memberJuzConflict) {
            result.push(
                `Gagal mendaftarkan member ${name}. ${memberJuzConflict.name} saat ini sedang membaca juz ${memberJuzConflict.currentJuz}.`
            );
            continue;
        }

        await memberServices.create({
            name,
            currentJuz,
            groupId,
        });

        result.push(
            `${name} berhasil didaftarkan ke dalam grup ini dan akan membaca juz ${currentJuz}.`
        );
    }
    message.reply(result.join("\n"));
};

module.exports = { handleSetMember, handleRegisterMember };
