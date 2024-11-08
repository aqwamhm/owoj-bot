const GroupHandler = require("../GroupHandler");
const groupServices = require("../../services/group");
const { validate } = require("../../utils/validator");
const groupViews = require("../../views/group");

jest.mock("../../services/group");
jest.mock("../../utils/validator");
jest.mock("../../views/error");
jest.mock("../../views/admin");

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
});
