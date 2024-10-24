const { handleCreateGroup } = require("../handlers/groupHandlers");
const {
    handleSetMember,
    handleRegisterMember,
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
        command: "/set",
        handler: handleSetMember,
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
        command: "/register",
        handler: handleRegisterMember,
    },
    {
        command: "/semangat",
        handler: handleMotivationRequest,
    },
];

module.exports = routes;
