const GroupHandler = require("../GroupHandler");
const groupServices = require("../../services/group");
const adminServices = require("../../services/admin");
const { validate } = require("../../utils/validator");
const groupViews = require("../../views/group");
const NotFoundError = require("../../exceptions/NotFoundError");

jest.mock("../../services/group");
jest.mock("../../services/admin");
jest.mock("../../utils/validator");
jest.mock("../../views/error");
jest.mock("../../views/group");
jest.mock("../../views/admin");

describe("GroupHandler", () => {
    describe("handleCreateGroup", () => {
        it("should create a new group successfully", async () => {
            const message = {
                body: "/register-group 123",
                key: { remoteJid: "123" },
            };
            const validation = {};

            validate.mockReturnValue({ number: 123 });
            groupServices.find.mockResolvedValue(null);
            groupServices.create.mockResolvedValue(true);

            const result = await GroupHandler.handleCreateGroup({
                message,
                validation,
            });

            expect(result).toEqual(groupViews.success.create({ number: 123 }));
        });
    });

    describe("handleRemoveGroup", () => {
        it("should remove an existing group successfully", async () => {
            const message = {
                body: "/remove-group 3",
                key: { remoteJid: "group-id" },
            };
            const validation = {};
            const group = { id: "group-id", number: 3 };

            validate.mockReturnValue({ number: 3 });
            groupServices.find.mockResolvedValue(group);
            groupServices.remove.mockResolvedValue(true);

            const result = await GroupHandler.handleRemoveGroup({
                message,
                validation,
            });

            expect(result).toEqual(groupViews.success.remove({ number: 3 }));
        });

        it("should throw NotFoundError if group number does not match", async () => {
            const message = {
                body: "/remove-group 4",
                key: { remoteJid: "group-id" },
            };
            const validation = {};
            const group = { id: "group-id", number: 3 };

            validate.mockReturnValue({ number: 4 });
            groupServices.find.mockResolvedValue(group);

            await expect(() =>
                GroupHandler.handleRemoveGroup({ message, validation })
            ).rejects.toThrow(new NotFoundError());
        });
    });

    describe("handleSetGroupAdmin", () => {
        it("should set group admin successfully", async () => {
            const message = {
                body: "/set-admin 621234567890",
                key: { remoteJid: "group-id" },
            };
            const validation = {};
            const middlewareData = {
                group: { id: "group-id", number: 5 },
            };
            const admin = { name: "Admin Name", phoneNumber: "621234567890" };

            validate.mockReturnValue({ phone: "621234567890" });
            adminServices.find.mockResolvedValue(admin);
            groupServices.update.mockResolvedValue(true);

            const result = await GroupHandler.handleSetGroupAdmin({
                message,
                validation,
                middlewareData,
            });

            expect(result).toEqual(
                groupViews.success.setGroupAdmin({
                    name: admin.name,
                    number: middlewareData.group.number,
                })
            );
            expect(groupServices.update).toHaveBeenCalledWith({
                adminPhoneNumber: "621234567890",
                id: "group-id",
            });
        });

        it("should throw NotFoundError if admin is not found", async () => {
            const message = {
                body: "/set-admin 629876543210",
                key: { remoteJid: "group-id" },
            };
            const validation = {};
            const middlewareData = {
                group: { id: "group-id", number: 5 },
            };

            validate.mockReturnValue({ phone: "629876543210" });
            adminServices.find.mockResolvedValue(null);

            await expect(() =>
                GroupHandler.handleSetGroupAdmin({
                    message,
                    validation,
                    middlewareData,
                })
            ).rejects.toThrow(new NotFoundError());
        });
    });
});
