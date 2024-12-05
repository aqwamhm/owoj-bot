const numberToEmoji = (number) => {
    let numStr = String(number);

    if (!/^-?\d+$/.test(numStr)) {
        return "";
    }

    const emojiMap = {
        0: "0️⃣",
        1: "1️⃣",
        2: "2️⃣",
        3: "3️⃣",
        4: "4️⃣",
        5: "5️⃣",
        6: "6️⃣",
        7: "7️⃣",
        8: "8️⃣",
        9: "9️⃣",
        "-": "➖",
    };

    let emojiNumber = "";
    for (let char of numStr) {
        emojiNumber += emojiMap[char];
    }

    return emojiNumber;
};

module.exports = { numberToEmoji };
