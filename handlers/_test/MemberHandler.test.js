const MemberHandler = require("../MemberHandler");
const ConflictError = require("../../exceptions/ConflictError");
const NotFoundError = require("../../exceptions/NotFoundError");
const memberServices = require("../../services/member");
const reportServices = require("../../services/report");
const { getPeriodDate } = require("../../utils/date");
const { validate } = require("../../utils/validator");
const memberViews = require("../../views/member");

jest.mock("../../services/member");
jest.mock("../../services/report");
jest.mock("../../utils/date");
jest.mock("../../utils/validator");
jest.mock("../../views/error");
jest.mock("../../views/member");

describe("MemberHandler", () => {
    describe("handleSetMemberJuz", () => {
        it("should set a member successfully", async () => {
            const message = {
                body: "#set 12#Aqwam",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({ juz: 12, name: "Aqwam" });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            memberServices.find.mockResolvedValueOnce({
                name: "Aqwam",
                currentJuz: 12,
            });
            memberServices.find.mockResolvedValueOnce(false);
            reportServices.updateMany.mockResolvedValue(true);
            memberServices.set.mockResolvedValue(true);

            const result = await MemberHandler.handleSetMemberJuz({
                message,
                validation,
            });

            expect(result).toEqual(
                memberViews.success.setJuz({ name: "Aqwam", currentJuz: 12 })
            );
        });

        it("should throw NotFoundError if member does not exist", async () => {
            const message = {
                body: "/remove Aqwam",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({ juz: 12, name: "Aqwam" });
            memberServices.find.mockResolvedValue(null);

            await expect(
                MemberHandler.handleSetMemberJuz({ message, validation })
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw ConflictError if member juz conflict", async () => {
            const message = {
                body: "#set 12#Aqwam",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({ juz: 12, name: "Aqwam" });
            memberServices.find.mockResolvedValueOnce({
                name: "Aqwam",
                currentJuz: 12,
            });
            memberServices.find.mockResolvedValueOnce({
                name: "Ivo",
                currentJuz: 12,
            });

            await expect(
                MemberHandler.handleSetMemberJuz({ message, validation })
            ).rejects.toThrow(ConflictError);
        });
    });

    describe("handleSetMemberName", () => {
        it("should successfully rename a member", async () => {
            const message = {
                body: "/set-nama Fauziah#Fauziyah",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                oldName: "Fauziah",
                newName: "Fauziyah",
            });
            memberServices.find.mockResolvedValueOnce({ name: "Fauziah" });
            memberServices.find.mockResolvedValueOnce(null);
            memberServices.set.mockResolvedValue(true);

            const result = await MemberHandler.handleSetMemberName({
                message,
                validation,
            });

            expect(result).toEqual(
                memberViews.success.setName({
                    oldName: "Fauziah",
                    newName: "Fauziyah",
                })
            );
        });

        it("should throw ConflictError if new name already exists", async () => {
            const message = {
                body: "/set-nama Fauziah#Fauziyah",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                oldName: "Fauziah",
                newName: "Fauziyah",
            });
            memberServices.find.mockResolvedValueOnce({ name: "Fauziah" });
            memberServices.find.mockResolvedValueOnce({ name: "Fauziyah" });

            await expect(
                MemberHandler.handleSetMemberName({ message, validation })
            ).rejects.toThrow(ConflictError);
        });

        it("should throw NotFoundError if old member does not exist", async () => {
            const message = {
                body: "/set-nama Fauziah#Fauziyah",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                oldName: "Fauziah",
                newName: "Fauziyah",
            });
            memberServices.find.mockResolvedValueOnce(null);

            await expect(
                MemberHandler.handleSetMemberName({ message, validation })
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("handleRegisterMember", () => {
        it("should register a new member successfully", async () => {
            const message = {
                body: "/register 1#Aqwam 2#John Doe 3#Maria",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue([
                { name: "Aqwam", juz: 1 },
                { name: "John Doe", juz: 2 },
                { name: "Maria", juz: 3 },
            ]);
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            memberServices.find.mockResolvedValue(null);
            memberServices.create.mockResolvedValue(true);
            reportServices.create.mockResolvedValue(true);

            const result = await MemberHandler.handleRegisterMember({
                message,
                validation,
            });

            expect(result).toEqual(
                [
                    memberViews.success.register({
                        name: "Aqwam",
                        currentJuz: 1,
                    }),
                    memberViews.success.register({
                        name: "John Doe",
                        currentJuz: 2,
                    }),
                    memberViews.success.register({
                        name: "Maria",
                        currentJuz: 3,
                    }),
                ].join("\n")
            );
        });

        it("should handle name conflict", async () => {
            const message = {
                body: "/register 1#Aqwam 2#John Doe 3#Maria",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue([
                { name: "Aqwam", juz: 1 },
                { name: "John Doe", juz: 2 },
                { name: "Maria", juz: 3 },
            ]);
            memberServices.find.mockResolvedValueOnce({ name: "Aqwam" });
            memberServices.find.mockResolvedValue(null);

            const result = await MemberHandler.handleRegisterMember({
                message,
                validation,
            });

            expect(result).toEqual(
                [
                    memberViews.error.nameConflict({ name: "Aqwam" }),
                    memberViews.success.register({
                        name: "John Doe",
                        currentJuz: 2,
                    }),
                    memberViews.success.register({
                        name: "Maria",
                        currentJuz: 3,
                    }),
                ].join("\n")
            );
        });

        it("should handle juz conflict", async () => {
            const message = {
                body: "/register 1#Aqwam 2#John Doe 3#Maria",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue([
                { name: "Aqwam", juz: 1 },
                { name: "John Doe", juz: 2 },
                { name: "Maria", juz: 3 },
            ]);
            memberServices.find.mockResolvedValueOnce(null);
            memberServices.find.mockResolvedValueOnce({
                name: "ExistingMember",
                currentJuz: 1,
            });

            const result = await MemberHandler.handleRegisterMember({
                message,
                validation,
            });

            expect(result).toEqual(
                [
                    memberViews.error.juzConflict({
                        name: "ExistingMember",
                        currentJuz: 1,
                    }),
                    memberViews.success.register({
                        name: "John Doe",
                        currentJuz: 2,
                    }),
                    memberViews.success.register({
                        name: "Maria",
                        currentJuz: 3,
                    }),
                ].join("\n")
            );
        });
    });

    describe("handleRemoveMember", () => {
        it("should remove a member successfully", async () => {
            const message = {
                body: "/remove Aqwam",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({ name: "Aqwam" });
            memberServices.find.mockResolvedValue({ name: "Aqwam" });
            memberServices.remove.mockResolvedValue(true);

            const result = await MemberHandler.handleRemoveMember({
                message,
                validation,
            });

            expect(result).toEqual(
                memberViews.success.remove({ name: "Aqwam" })
            );
        });

        it("should throw NotFoundError if member does not exist", async () => {
            const message = {
                body: "/remove Aqwam",
                key: { remoteJid: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({ name: "Aqwam" });
            memberServices.find.mockResolvedValue(null);

            await expect(
                MemberHandler.handleRemoveMember({ message, validation })
            ).rejects.toThrow(NotFoundError);
        });
    });
});
