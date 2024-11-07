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

const commands = () => [
    {
        prompt: "/register-group",
        handler: handleCreateGroup,
        middlewares: [verifyMessageFromAdmin],
        validation: {
            regex: /^\/register-group\s+\d+\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/register",
        handler: handleRegisterMember,
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*(?=\d|$)/g,
            multiple: true,
        },
    },
    {
        prompt: "/set",
        handler: handleSetMember,
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/set\s+(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/remove",
        handler: handleRemoveMember,
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/remove\s+(?<name>[a-zA-Z\s]+?)\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/register-admin",
        handler: handleRegisterAdmin,
        middlewares: [],
        validation: {
            regex: /^\/register-admin\s+(?<name>[a-zA-Z\s]+)#(?<phone>\d+)\s+(?<password>\S+)$/,
            multiple: false,
        },
    },
    {
        prompt: "/remove-admin",
        handler: handleRemoveAdmin,
        middlewares: [verifyMessageFromAdmin],
        validation: {
            regex: /^\/remove-admin\s+(?<phone>\d+)$/,
            multiple: false,
        },
    },
    {
        prompt: "/lapor",
        handler: handleCreateReport,
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+\/\d+|terjemah|murottal)(?:\s*-\s*(?<previousPeriods>\d+))?\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/batal-lapor",
        handler: handleRemoveReport,
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/batal-lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+\/\d+|terjemah|murottal)(?:\s*-\s*(?<previousPeriods>\d+))?\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/list",
        handler: handleShowList,
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/list\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/semangat",
        handler: handleMotivationRequest,
        middlewares: [verifyMessageInOWOJGroup],
    },
];

module.exports = { commands };
