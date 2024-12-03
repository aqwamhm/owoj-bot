const NotFoundError = require("../exceptions/NotFoundError");
const groupServices = require("../services/group");
const groupViews = require("../views/group");

const verifyMessageInOWOJGroup = async (message) => {
    const groupId = message.id.remote;
    const group = await groupServices.find({ id: groupId });

    if (!group) {
        throw new NotFoundError(groupViews.error.notFound());
    }

    return { group };
};

module.exports = verifyMessageInOWOJGroup;
