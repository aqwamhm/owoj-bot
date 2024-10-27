const { handleCreateGroup } = require("../handlers/groupHandlers");
const {
    handleSetMember,
    handleRegisterMember,
    handleRemoveMember,
} = require("../handlers/memberHandlers");
const {
    handleCreateReport,
    handleRemoveReport,
} = require("../handlers/reportHandlers");
const { handleShowList } = require("../handlers/listHandlers");
const { handleMotivationRequest } = require("../handlers/motivationHandlers");
const {
    handleRegisterAdmin,
    handleRemoveAdmin,
} = require("../handlers/adminHandlers");
const verifyMessageFromAdmin = require("../middlewares/verifyMessageFromAdmin");
const verifyMessageInOWOJGroup = require("../middlewares/verifyMessageInOWOJGroup");

const routes = () => [
    {
        command: "/register-group",
        handler: handleCreateGroup,
        middlewares: [verifyMessageFromAdmin],
    },
    {
        command: "/register",
        handler: handleRegisterMember,
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
    },
    {
        command: "/set",
        handler: handleSetMember,
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
    },
    {
        command: "/remove",
        handler: handleRemoveMember,
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
    },
    {
        command: "/register-admin",
        handler: handleRegisterAdmin,
        middlewares: [],
    },
    {
        command: "/remove-admin",
        handler: handleRemoveAdmin,
        middlewares: [verifyMessageFromAdmin],
    },
    {
        command: "/lapor",
        handler: handleCreateReport,
        middlewares: [verifyMessageInOWOJGroup],
    },
    {
        command: "/batal-lapor",
        handler: handleRemoveReport,
        middlewares: [verifyMessageInOWOJGroup],
    },
    {
        command: "/list",
        handler: handleShowList,
        middlewares: [verifyMessageInOWOJGroup],
    },
    {
        command: "/semangat",
        handler: handleMotivationRequest,
        middlewares: [verifyMessageInOWOJGroup],
    },
];

module.exports = routes;
