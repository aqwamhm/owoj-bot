const getPeriodDate = (period = 0, testDate = null) => {
    const WIB_OFFSET = 7;
    const now = testDate ? new Date(testDate) : new Date();

    const wibDate = new Date(now.getTime() + WIB_OFFSET * 60 * 60 * 1000);

    const startDay = Math.min(
        Math.max(parseInt(process.env.PERIOD_START_DAY || "6", 10) % 7, 0),
        6
    );
    const startHour = Math.min(
        Math.max(parseInt(process.env.PERIOD_START_HOUR || "18", 10), 0),
        23
    );

    const periodStart = new Date(wibDate);
    periodStart.setUTCHours(startHour, 0, 0, 0);
    periodStart.setUTCDate(
        periodStart.getUTCDate() -
            ((periodStart.getUTCDay() - startDay + 7) % 7)
    );

    if (wibDate < periodStart) {
        periodStart.setUTCDate(periodStart.getUTCDate() - 7);
    }

    periodStart.setUTCDate(periodStart.getUTCDate() + period * 7);

    const periodEnd = new Date(periodStart);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 7);
    periodEnd.setUTCMilliseconds(periodEnd.getUTCMilliseconds() - 1);

    const utcStart = new Date(
        periodStart.getTime() - WIB_OFFSET * 60 * 60 * 1000
    );
    const utcEnd = new Date(periodEnd.getTime() - WIB_OFFSET * 60 * 60 * 1000);

    return {
        startDate: utcStart.toISOString(),
        endDate: utcEnd.toISOString(),
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
