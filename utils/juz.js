const incrementJuz = (juz, number = 1) => {
    return ((juz - 1 + number) % 30) + 1;
};

const decrementJuz = (juz, number = 1) => {
    return ((juz - 1 - number + 30) % 30) + 1;
};

module.exports = { incrementJuz, decrementJuz };
