const getPeriodDate = (period = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    const startDay = Math.min(
        Math.max(parseInt(process.env.PERIOD_START_DAY || "1", 10) % 7, 0),
        6
    );

    const startHour = Math.min(
        Math.max(parseInt(process.env.PERIOD_START_HOUR || "0", 10), 0),
        23
    );

    let startDayOffset = (currentDay - startDay + 7) % 7;

    if (
        (currentDay === startDay && currentHour < startHour) ||
        (startDayOffset === 0 && currentHour < startHour)
    ) {
        startDayOffset = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - startDayOffset + period * 7);
    startDate.setHours(startHour, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    endDate.setHours(startHour, 0, 0, -1);

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
