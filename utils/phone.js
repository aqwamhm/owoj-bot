const standardizePhoneNumber = (phoneNumber) => {
    let str = String(phoneNumber);
    let cleanedNumber = str.replace(/\D/g, "");

    if (cleanedNumber.startsWith("0")) {
        cleanedNumber = "62" + cleanedNumber.substring(1);
    }

    return cleanedNumber;
};

const formatPhoneNumber = (number) => {
    if (number === "") {
        return "";
    }
    if (!number.startsWith("62")) {
        number = "62" + number;
    }
    let countryCode = "62";
    let nationalNumber = number.slice(2);
    let formatted = "+" + countryCode + " ";
    let remainingDigits = nationalNumber.length;
    if (remainingDigits >= 11) {
        formatted += nationalNumber.substring(0, 3) + "-";
        formatted += nationalNumber.substring(3, 7) + "-";
        formatted += nationalNumber.substring(7, 11);
    } else if (remainingDigits === 10) {
        formatted += nationalNumber.substring(0, 3) + "-";
        formatted += nationalNumber.substring(3, 6) + "-";
        formatted += nationalNumber.substring(6, 10);
    } else if (remainingDigits === 9) {
        formatted += nationalNumber.substring(0, 3) + "-";
        formatted += nationalNumber.substring(3, 6) + "-";
        formatted += nationalNumber.substring(6, 9);
    } else if (remainingDigits === 7) {
        formatted += nationalNumber.substring(0, 3) + "-";
        formatted += nationalNumber.substring(3, 7);
    } else {
        formatted += nationalNumber;
    }
    return formatted;
};

module.exports = {
    standardizePhoneNumber,
    formatPhoneNumber,
};
