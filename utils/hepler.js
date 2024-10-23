const getPeriodDate = (period = 0) => {
    const now = new Date();
    const currentDay = now.getDay();

    const daysToAdjust = period * 7;

    const monday = new Date(now);
    monday.setDate(
        now.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + daysToAdjust
    );
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
        startDate: monday.toISOString(),
        endDate: sunday.toISOString(),
    };
};

const showFormattedDate = (date) => {
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    return new Date(date).toLocaleDateString("id-ID", options);
};

module.exports = { getPeriodDate, showFormattedDate };
