const validations = {
    reportCommand: {
        regex: /^#lapor\s+(?<name>[a-zA-Z]+)#(?<pages>\d+)(?:\s+-(?<previousPeriods>\d+))?$/,
    },
    setCommand: {
        regex: /^#set\s+((?<juz>\d+)#(?<name>[a-zA-Z\s]+)(?:\s+|$))+/,
    },
    createGroupCommand: {
        regex: /^#create\s+\d+$/,
    },
    listCommand: {
        regex: /^#list$/,
    },
};

module.exports = validations;
