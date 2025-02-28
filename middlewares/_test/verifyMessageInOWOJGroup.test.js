const verifyMessageInOWOJGroup = require("../verifyMessageInOWOJGroup");
const NotFoundError = require("../../exceptions/NotFoundError");
const groupServices = require("../../services/group");

jest.mock("../../services/group");
jest.mock("../../views/group", () => ({
    error: {
        notFound: jest.fn(() => "Group not found"),
    },
}));

describe("verifyMessageInOWOJGroup", () => {
    let message;

    beforeEach(() => {
        message = {
            body: "",
            key: {
                remoteJid: "groupId",
            },
        };
    });

    test("should throw NotFoundError if group is not found", async () => {
        groupServices.find.mockResolvedValue(null);

        await expect(verifyMessageInOWOJGroup(message)).rejects.toThrow(
            NotFoundError
        );
        await expect(verifyMessageInOWOJGroup(message)).rejects.toThrow(
            "Group not found"
        );
    });

    test("should not throw an error if group is found", async () => {
        groupServices.find.mockResolvedValue({});

        await expect(verifyMessageInOWOJGroup(message)).resolves.not.toThrow();
    });
});
