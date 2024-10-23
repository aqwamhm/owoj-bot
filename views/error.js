const errorMessages = {
    validation({ format, example }) {
        return `Command tidak valid!

Berikut adalah ${format ? "format" : "contoh"} yang benar: 
${format ? format : ""}
${format && example ? "\nContoh: " : ""}${example ? example : ""}`;
    },
};

module.exports = errorMessages;
