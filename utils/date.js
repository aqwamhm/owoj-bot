const getPeriodDate = (period = 0, testDate = null) => {
    const WIB_OFFSET = 7;
    const now = testDate ? new Date(testDate) : new Date();

    const utcHour = now.getUTCHours();
    const wibHour = (utcHour + WIB_OFFSET) % 24;

    const utcDay = now.getUTCDay();
    const isNextDay = utcHour + WIB_OFFSET >= 24;
    const wibDay = isNextDay ? (utcDay + 1) % 7 : utcDay;

    const startDay = Math.min(
        Math.max(parseInt(process.env.PERIOD_START_DAY || "6", 10) % 7, 0),
        6
    );
    const startHour = Math.min(
        Math.max(parseInt(process.env.PERIOD_START_HOUR || "18", 10), 0),
        23
    );

    let startDayOffset = (wibDay - startDay + 7) % 7;

    const wibTimeIsBeforeStart = wibHour < startHour;

    if (isNextDay) {
        if (wibDay === startDay && !wibTimeIsBeforeStart) {
            startDayOffset = 0;
        } else if (startDayOffset === 1 && wibTimeIsBeforeStart) {
            startDayOffset = 0;
        }
    } else {
        if (wibDay === startDay && wibTimeIsBeforeStart) {
            startDayOffset = 7;
        } else if (startDayOffset === 0 && wibTimeIsBeforeStart) {
            startDayOffset = 7;
        }
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
