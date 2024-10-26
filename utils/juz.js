const incrementJuz = (juz) => {
    if (juz + 1 === 31) {
        return 1;
    }

    return juz + 1;
};

const decrementJuz = (juz) => {
    if (juz - 1 === 0) {
        return 30;
    }

    return juz - 1;
};

module.exports = { incrementJuz, decrementJuz };
