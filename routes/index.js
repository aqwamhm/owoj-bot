const AdminHandler = require("../handlers/AdminHandler");
const MemberHandler = require("../handlers/MemberHandler");
const GroupHandler = require("../handlers/GroupHandler");
const ReportHandler = require("../handlers/ReportHandler");
const ListHandler = require("../handlers/ListHandler");
const UtilityHandler = require("../handlers/UtilityHandler");
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
        prompt: "/remove-group",
        handler: GroupHandler.handleRemoveGroup.bind(GroupHandler),
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/remove-group\s+\d+\s*$/,
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
        prompt: "/set-juz",
        handler: MemberHandler.handleSetMemberJuz.bind(MemberHandler),
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/set-juz\s+(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/set-nama",
        handler: MemberHandler.handleSetMemberName.bind(MemberHandler),
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/set-nama\s+(?<oldName>[a-zA-Z\s]+?)\s*#\s*(?<newName>[a-zA-Z\s]+?)\s*$/,
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
        prompt: "/set-admin",
        handler: GroupHandler.handleSetGroupAdmin.bind(GroupHandler),
        middlewares: [verifyMessageFromAdmin, verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/set-admin\s+(?<phone>\+?\d+)\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/lapor",
        handler: ReportHandler.handleCreateReport.bind(ReportHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/lapor\s+(?<name>[a-zA-Z\s]+?)\s*#\s*(?<pages>\d+\s*\/\s*\d+)\s*(?:#\s*(?<type>terjemah|murottal))?\s*(?:-\s*(?<period>\d+))?\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/batal-lapor",
        handler: ReportHandler.handleRemoveReport.bind(ReportHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/batal-lapor\s+(?<name>[a-zA-Z\s]+?)\s*#\s*(?<pages>\d+\s*\/\s*\d+)\s*(?:#\s*(?<type>terjemah|murottal))?\s*(?:-\s*(?<period>\d+))?\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/list",
        handler: ListHandler.handleShowMemberList.bind(ListHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/list\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/list-progress",
        handler: ListHandler.handleShowUncompletedMemberList.bind(ListHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {
            regex: /^\/list-progress\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/list-admin",
        handler: ListHandler.handleShowAdminList.bind(ListHandler),
        middlewares: [verifyMessageFromAdmin],
        validation: {
            regex: /^\/list-admin\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/list-group",
        handler: ListHandler.handleShowGroupList.bind(ListHandler),
        middlewares: [verifyMessageFromAdmin],
        validation: {
            regex: /^\/list-group\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/semangat",
        handler: UtilityHandler.handleMotivationRequest.bind(UtilityHandler),
        middlewares: [verifyMessageInOWOJGroup],
        validation: {},
    },
    {
        prompt: "/waktu-sholat",
        handler: UtilityHandler.handlePrayerTimeRequest.bind(UtilityHandler),
        middlewares: [],
        validation: {
            regex: /^\/waktu-sholat\s+(?<location>Kota\s+[a-zA-Z\s]+|Kabupaten\s+[a-zA-Z\s]+|[a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*(?:\+\s*(?<days>\d+))?\s*$/,
            multiple: false,
        },
    },
    {
        prompt: "/tafsir",
        handler: UtilityHandler.handleTafsirRequest.bind(UtilityHandler),
        middlewares: [],
        validation: {
            regex: /^\/tafsir\s+(?<page>\d+)\s*$/,
            multiple: false,
        },
    },
];

const crons = (handler) => [
    {
        prompt: "!one-day-reminder!",
        middlewares: [verifyMessageFromAdmin],
        handler: handler.handleOneDayBeforeNewPeriod.bind(handler),
    },
    {
        prompt: "!new-period!",
        middlewares: [verifyMessageFromAdmin],
        handler: handler.handleNewPeriod.bind(handler),
    },
];

module.exports = { commands, crons };
