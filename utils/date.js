const getPeriodDate = (period = 0) => {
    const WIB_OFFSET = 7;

    const now = new Date();
    const utcHour = now.getUTCHours();
    const wibHour = (utcHour + WIB_OFFSET) % 24;

    const utcDay = now.getUTCDay();
    const wibDay = utcHour + WIB_OFFSET >= 24 ? (utcDay + 1) % 7 : utcDay;

    const startDay = Math.min(
        Math.max(parseInt(process.env.PERIOD_START_DAY || "6", 10) % 7, 0),
        6
    );

    const startHour = Math.min(
        Math.max(parseInt(process.env.PERIOD_START_HOUR || "18", 10), 0),
        23
    );

    let startDayOffset = (wibDay - startDay + 7) % 7;

    if (
        (wibDay === startDay && wibHour < startHour) ||
        (startDayOffset === 0 && wibHour < startHour)
    ) {
        startDayOffset = 7;
    }

    const startDate = new Date(now);
    startDate.setUTCDate(now.getUTCDate() - startDayOffset + period * 7);
    const utcStartHour = (startHour - WIB_OFFSET + 24) % 24;
    startDate.setUTCHours(utcStartHour, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 7);
    endDate.setUTCHours(utcStartHour, 0, 0, -1);

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
