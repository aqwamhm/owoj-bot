const ValidationError = require("../exceptions/ValidationError");

const validate = ({ command, validation, errorMessage }) => {
    const match = validation.regex.exec(command);
    if (!match) {
        throw new ValidationError(errorMessage);
    }

    return match.groups;
};

module.exports = { validate };
