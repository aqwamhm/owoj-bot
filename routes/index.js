const AdminHandler = require("../handlers/AdminHandler");
const MemberHandler = require("../handlers/MemberHandler");
const GroupHandler = require("../handlers/GroupHandler");
const ReportHandler = require("../handlers/ReportHandler");
const ListHandler = require("../handlers/ListHandler");
const MotivationHandler = require("../handlers/MotivationHandler");
const verifyMessageFromAdmin = require("../middlewares/verifyMessageFromAdmin");
const verifyMessageInOWOJGroup = require("../middlewares/verifyMessageInOWOJGroup");

const commands = () => [
    {
        prompt: "/register-group",
        handler: GroupHandler.handleCreateGroup.bind(GroupHandler),
        middlewares: [verifyMessageFromAdmin],
        validation: {
            regex: /^\/register-group\s+\d+\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/register",
        handler: MemberHandler.handleRegisterMember.bind(MemberHandler),
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*(?=\d|$)/g,
            multiple: true,
        },
    },
    {
        prompt: "/set",
        handler: MemberHandler.handleSetMember.bind(MemberHandler),
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/set\s+(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/remove",
        handler: MemberHandler.handleRemoveMember.bind(MemberHandler),
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/remove\s+(?<name>[a-zA-Z\s]+?)\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/register-admin",
        handler: AdminHandler.handleRegisterAdmin.bind(AdminHandler),
        middlewares: [],
        validation: {
            regex: /^\/register-admin\s+(?<name>[a-zA-Z\s]+)#(?<phone>\d+)\s+(?<password>\S+)$/,
            multiple: false,
        },
    },
    {
        prompt: "/remove-admin",
        handler: AdminHandler.handleRemoveAdmin.bind(AdminHandler),
        middlewares: [verifyMessageFromAdmin],
        validation: {
            regex: /^\/remove-admin\s+(?<phone>\d+)$/,
            multiple: false,
        },
    },
    {
        prompt: "/lapor",
        handler: ReportHandler.handleCreateReport.bind(ReportHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+\/\d+|terjemah|murottal)(?:\s*-\s*(?<previousPeriods>\d+))?\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/batal-lapor",
        handler: ReportHandler.handleRemoveReport.bind(ReportHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/batal-lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+\/\d+|terjemah|murottal)(?:\s*-\s*(?<previousPeriods>\d+))?\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/list",
        handler: ListHandler.handleShowList.bind(ListHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/list\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/semangat",
        handler:
            MotivationHandler.handleMotivationRequest.bind(MotivationHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {},
    },
];

module.exports = { commands };