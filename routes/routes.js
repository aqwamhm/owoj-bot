const { handleCreateGroup } = require("../handlers/groupHandlers");
const {
    handleSetMember,
    handleRegisterMember,
    handleRemoveMember,
} = require("../handlers/memberHandlers");
const { handleCreateReport } = require("../handlers/reportHandlers");
const { handleShowList } = require("../handlers/listHandlers");
const { handleMotivationRequest } = require("../handlers/motivationHandlers");
const {
    handleRegisterAdmin,
    handleRemoveAdmin,
} = require("../handlers/adminHandlers");

const routes = () => [
    {
        command: "/create",
        handler: handleCreateGroup,
    },
    {
        command: "/register",
        handler: handleRegisterMember,
    },
    {
        command: "/set",
        handler: handleSetMember,
    },
    {
        command: "/remove",
        handler: handleRemoveMember,
    },
    {
        command: "/register-admin",
        handler: handleRegisterAdmin,
    },
    {
        command: "/remove-admin",
        handler: handleRemoveAdmin,
    },
    {
        command: "/lapor",
        handler: handleCreateReport,
    },
    {
        command: "/list",
        handler: handleShowList,
    },
    {
        command: "/semangat",
        handler: handleMotivationRequest,
    },
];

module.exports = routes;
