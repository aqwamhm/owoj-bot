const { handleCreateGroup } = require("../handlers/groupHandlers");
const {
    handleSetMember,
    handleRegisterMember,
    handleRemoveMember,
} = require("../handlers/memberHandlers");
const { handleCreateReport } = require("../handlers/reportHandlers");
const { handleShowList } = require("../handlers/listHandlers");
const { handleMotivationRequest } = require("../handlers/motivationHandlers");

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
