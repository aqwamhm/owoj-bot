const getPeriodDate = (period = 0) => {
    const now = new Date();
    const currentDay = now.getDay();

    const startDay = parseInt(process.env.PERIOD_START_DAY || "1", 10);
    const startHour = parseInt(process.env.PERIOD_START_HOUR || "0", 10);
    const daysToAdjust = period * 7;

    const startDate = new Date(now);
    const startDayOffset =
        currentDay >= startDay
            ? currentDay - startDay
            : 7 - (startDay - currentDay);
    startDate.setDate(now.getDate() - startDayOffset + daysToAdjust);
    startDate.setHours(startHour, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(startHour - 1, 59, 59, 999);

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    };
};

const showFormattedDate = (date) => {
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    return new Date(date).toLocaleDateString("id-ID", options);
};

const daysOfWeek = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
];

module.exports = { getPeriodDate, showFormattedDate, daysOfWeek };
