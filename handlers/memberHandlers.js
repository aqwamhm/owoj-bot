const ConflictError = require("../exceptions/ConflictError");
const NotFoundError = require("../exceptions/NotFoundError");
const memberServices = require("../services/member");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");

const { validate } = require("../utils/validator");
const errorMessages = require("../views/error");
const memberViews = require("../views/member");

const handleSetMember = async (message, validation) => {
    const { juz, name } = validate({
        command: message.body,
        validation,
        errorMessage: errorMessages.validation({
            format: "#set <juz#nama>",
            example: "#set 12#Aqwam",
        }),
    });
    const groupId = message.id.remote;
    const { startDate, endDate } = getPeriodDate();

    if (!(await memberServices.find({ groupId, name }))) {
        throw new NotFoundError(memberViews.error.notFound({ name }));
    }

    const memberJuzConflict = await memberServices.find({
        groupId,
        currentJuz: juz,
    });
    if (memberJuzConflict) {
        throw new ConflictError(
            memberViews.error.juzConflict({
                name: memberJuzConflict.name,
                currentJuz: memberJuzConflict.currentJuz,
            })
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

    return memberViews.success.set({ name, currentJuz: juz });
};

const handleRegisterMember = async (message, validation) => {
    let result = [];
    const members = validate({
        command: message.body,
        validation,
        errorMessage: errorMessages.validation({
            format: "/register <juz>#<nama>",
            example: "/register 1#Aqwam 2#John Doe 3#Maria",
        }),
    });

    const { startDate, endDate } = getPeriodDate();

    const groupId = message.id.remote;

    for (const { name, juz: currentJuz } of members) {
        if (await memberServices.find({ groupId, name })) {
            result.push(memberViews.error.nameConflict({ name }));
            continue;
        }

        const memberJuzConflict = await memberServices.find({
            groupId,
            currentJuz,
        });
        if (memberJuzConflict) {
            result.push(memberViews.error.conflict({ name, currentJuz }));
            continue;
        }

        await memberServices.create({
            name,
            currentJuz,
            groupId,
        });

        await reportServices.create({
            name,
            groupId,
            juz: currentJuz,
            pages: 0,
            startDate,
            endDate,
        });

        result.push(memberViews.success.register({ name, currentJuz }));
    }
    return result.join("\n");
};

const handleRemoveMember = async (message, validation) => {
    const { name } = validate({
        command: message.body,
        validation,
        errorMessage: errorMessages.validation({
            format: "/remove <name>",
            example: "/remove Aqwam",
        }),
    });

    const groupId = message.id.remote;

    const member = await memberServices.find({ groupId, name });
    if (!member) {
        throw new NotFoundError(memberViews.error.notFound({ name }));
    }

    await memberServices.remove({ groupId, name });
    return memberViews.success.remove({ name });
};

module.exports = { handleSetMember, handleRegisterMember, handleRemoveMember };
