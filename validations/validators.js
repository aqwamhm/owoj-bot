const ValidationError = require("../exceptions/ValidationError");

const validate = ({ command, validation, errorMessage }) => {
    const { regex, multiple } = validation;

    if (multiple) {
        const matches = [...command.matchAll(regex)];
        if (matches.length === 0) {
            throw new ValidationError(errorMessage);
        }

        return matches.map((match) => match.groups);
    } else {
        const match = regex.exec(command);
        if (!match) {
            throw new ValidationError(errorMessage);
        }

        return match.groups;
    }
};

module.exports = { validate };
