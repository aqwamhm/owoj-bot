const validations = {
    createReportCommand: {
        regex: /^\/lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+|terjemah|murottal)(?:\s*-\s*(?<previousPeriods>\d+))?\s*$/,
        multiple: false,
    },
    removeReportCommand: {
        regex: /^\/batal-lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+|terjemah|murottal)(?:\s*-\s*(?<previousPeriods>\d+))?\s*$/,
        multiple: false,
    },
    setMemberCommand: {
        regex: /^\/set\s+(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*$/,
        multiple: false,
    },
    registerMemberCommand: {
        regex: /(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*(?=\d|$)/g,
        multiple: true,
    },
    removeMemberCommand: {
        regex: /^\/remove\s+(?<name>[a-zA-Z\s]+?)\s*$/,
        multiple: false,
    },
    registerAdminCommand: {
        regex: /^\/register-admin\s+(?<name>[a-zA-Z\s]+)#(?<phone>\d+)\s+(?<password>\S+)$/,
        multiple: false,
    },
    removeAdminCommand: {
        regex: /^\/remove-admin\s+(?<phone>\d+)$/,
        multiple: false,
    },
    createGroupCommand: {
        regex: /^\/register-group\s+\d+\s*$/,
        multiple: false,
    },
    listCommand: {
        regex: /^\/list\s*$/,
        multiple: false,
    },
};

module.exports = validations;
