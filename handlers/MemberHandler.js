const ConflictError = require("../exceptions/ConflictError");
const NotFoundError = require("../exceptions/NotFoundError");
const memberServices = require("../services/member");
const reportServices = require("../services/report");
const { getPeriodDate } = require("../utils/date");
const validator = require("../utils/validator");
const errorMessages = require("../views/error");
const memberViews = require("../views/member");

class MemberHandler {
    constructor(
        memberServices,
        reportServices,
        validator,
        errorMessages,
        memberViews,
        getPeriodDate
    ) {
        this.memberServices = memberServices;
        this.reportServices = reportServices;
        this.validate = validator.validate;
        this.errorMessages = errorMessages;
        this.memberViews = memberViews;
        this.getPeriodDate = getPeriodDate;
    }

    async handleSetMemberJuz({ message, validation }) {
        const { juz, name } = this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "#set <juz#nama>",
                example: "#set 12#Aqwam",
            }),
        });
        const groupId = message.key.remoteJid;
        const { startDate, endDate } = this.getPeriodDate();

        if (!(await this.memberServices.find({ groupId, name }))) {
            throw new NotFoundError(this.memberViews.error.notFound({ name }));
        }

        const memberJuzConflict = await this.memberServices.find({
            groupId,
            currentJuz: juz,
        });
        if (memberJuzConflict) {
            throw new ConflictError(
                this.memberViews.error.juzConflict({
                    name: memberJuzConflict.name,
                    currentJuz: memberJuzConflict.currentJuz,
                })
            );
        }

        await this.reportServices.updateMany({
            memberName: name,
            memberGroupId: groupId,
            periodStartDate: startDate,
            periodEndDate: endDate,
            juz,
        });

        await this.memberServices.set({
            name,
            currentJuz: juz,
            groupId,
        });

        return this.memberViews.success.setJuz({ name, currentJuz: juz });
    }

    async handleSetMemberName({ message, validation }) {
        const { oldName, newName } = this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "/set-nama <nama lama>#<nama baru>",
                example: "/set-nama Fauziah#Fauziyah",
            }),
        });

        const groupId = message.key.remoteJid;

        const member = await this.memberServices.find({
            groupId,
            name: oldName,
        });

        if (!member) {
            throw new NotFoundError(
                this.memberViews.error.notFound({ name: oldName })
            );
        }

        const newMemberName = await this.memberServices.find({
            groupId,
            name: newName,
        });

        if (newMemberName) {
            throw new ConflictError(
                this.memberViews.error.nameConflict({ name: newName })
            );
        }

        await this.memberServices.set({
            groupId,
            name: oldName,
            newName,
        });

        return this.memberViews.success.setName({
            oldName,
            newName,
        });
    }

    async handleRegisterMember({ message, validation }) {
        let result = [];
        const members = this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "/register <juz>#<nama>",
                example: "/register 1#Aqwam 2#John Doe 3#Maria",
            }),
        });

        const { startDate, endDate } = this.getPeriodDate();
        const groupId = message.key.remoteJid;

        for (const { name, juz: currentJuz } of members) {
            if (await this.memberServices.find({ groupId, name })) {
                result.push(this.memberViews.error.nameConflict({ name }));
                continue;
            }

            const memberJuzConflict = await this.memberServices.find({
                groupId,
                currentJuz,
            });
            if (memberJuzConflict) {
                result.push(
                    this.memberViews.error.juzConflict({
                        name: memberJuzConflict.name,
                        currentJuz: memberJuzConflict.currentJuz,
                    })
                );
                continue;
            }

            await this.memberServices.create({
                name: name.trim(),
                currentJuz,
                groupId,
            });

            await this.reportServices.create({
                name: name.trim(),
                groupId,
                juz: currentJuz,
                pages: 0,
                startDate,
                endDate,
            });

            result.push(
                this.memberViews.success.register({ name, currentJuz })
            );
        }
        return result.join("\n");
    }

    async handleRemoveMember({ message, validation }) {
        const { name } = this.validate({
            command: message.body,
            validation,
            errorMessage: this.errorMessages.validation({
                format: "/remove <name>",
                example: "/remove Aqwam",
            }),
        });

        const groupId = message.key.remoteJid;

        const member = await this.memberServices.find({ groupId, name });
        if (!member) {
            throw new NotFoundError(this.memberViews.error.notFound({ name }));
        }

        await this.memberServices.remove({ groupId, name });
        return this.memberViews.success.remove({ name });
    }
}

module.exports = new MemberHandler(
    memberServices,
    reportServices,
    validator,
    errorMessages,
    memberViews,
    getPeriodDate
);
