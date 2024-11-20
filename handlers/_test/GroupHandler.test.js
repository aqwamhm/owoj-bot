const GroupHandler = require("../GroupHandler");
const groupServices = require("../../services/group");
const { validate } = require("../../utils/validator");
const groupViews = require("../../views/group");
const NotFoundError = require("../../exceptions/NotFoundError");

jest.mock("../../services/group");
jest.mock("../../utils/validator");
jest.mock("../../views/error");
jest.mock("../../views/group");

describe("GroupHandler", () => {
    describe("handleCreateGroup", () => {
        it("should create a new group successfully", async () => {
            const message = {
                body: "/register-group 123",
                id: { remote: "123" },
            };
            const validation = {};

            validate.mockReturnValue({ number: 123 });
            groupServices.find.mockResolvedValue(null);
            groupServices.create.mockResolvedValue(true);

            const result = await GroupHandler.handleCreateGroup(
                message,
                validation
            );

            expect(result).toEqual(groupViews.success.create({ number: 123 }));
        });
    });

    describe("handleRemoveGroup", () => {
        it("should remove an existing group successfully", async () => {
            const message = {
                body: "/remove-group 3",
                id: { remote: "group-id" },
            };
            const validation = {};
            const group = { id: "group-id", number: 3 };

            validate.mockReturnValue({ number: 3 });
            groupServices.find.mockResolvedValue(group);
            groupServices.remove.mockResolvedValue(true);

            const result = await GroupHandler.handleRemoveGroup(
                message,
                validation
            );

            expect(result).toEqual(groupViews.success.remove({ number: 3 }));
        });

        it("should throw NotFoundError if group number does not match", async () => {
            const message = {
                body: "/remove-group 4",
                id: { remote: "group-id" },
            };
            const validation = {};
            const group = { id: "group-id", number: 3 };

            validate.mockReturnValue({ number: 4 });
            groupServices.find.mockResolvedValue(group);

            await expect(() =>
                GroupHandler.handleRemoveGroup(message, validation)
            ).rejects.toThrow(new NotFoundError());
        });
    });
});
