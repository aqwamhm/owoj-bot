const validations = {
    createReportCommand: {
        regex: /^\/lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pages>\d+)(?:\s+-\s*(?<previousPeriods>\d+))?\s*$/,
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
    createGroupCommand: {
        regex: /^\/create\s+\d+\s*$/,
        multiple: false,
    },
    listCommand: {
        regex: /^\/list\s*$/,
        multiple: false,
    },
};

module.exports = validations;
