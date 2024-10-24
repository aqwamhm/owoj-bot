const validations = {
    createReportCommand: {
        regex: /^#lapor\s+(?<name>[a-zA-Z]+)#(?<pages>\d+)(?:\s+-(?<previousPeriods>\d+))?$/,
        multiple: false,
    },
    setMemberCommand: {
        regex: /^#set\s+(?<juz>\d+)#(?<name>[a-zA-Z\s]+)\s*$/,
        multiple: false,
    },
    registerMemberCommand: {
        regex: /(?<juz>\d+)#(?<name>[a-zA-Z\s]+)\s*/g,
        multiple: true,
    },
    createGroupCommand: {
        regex: /^#create\s+\d+$/,
        multiple: false,
    },
    listCommand: {
        regex: /^#list$/,
        multiple: false,
    },
};

module.exports = validations;
