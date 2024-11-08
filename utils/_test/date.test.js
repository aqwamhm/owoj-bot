const { getPeriodDate, showFormattedDate } = require("../date");

describe("Utils - getPeriodDate", () => {
    const defaultStartDay = 6;
    const defaultStartHour = 18;

    beforeEach(() => {
        delete process.env.PERIOD_START_DAY;
        delete process.env.PERIOD_START_HOUR;
    });

    afterAll(() => {
        delete process.env.PERIOD_START_DAY;
        delete process.env.PERIOD_START_HOUR;
    });

    it("should calculate the correct start and end dates when period parameter is not given", () => {
        const testDate = "2024-11-08T12:00:00.000Z";
        const { startDate, endDate } = getPeriodDate(undefined, testDate);

        expect(new Date(startDate).toISOString()).toBe(
            "2024-11-02T11:00:00.000Z"
        );
        expect(new Date(endDate).toISOString()).toBe(
            "2024-11-09T10:59:59.999Z"
        );
    });

    it("should calculate the correct start and end dates for the current period (period = 0) without testDate", () => {
        const { startDate, endDate } = getPeriodDate(0);

        expect(startDate).toBeDefined();
        expect(endDate).toBeDefined();
    });

    it("should calculate the correct start and end dates with default start day and hour", () => {
        const testDate = "2024-11-08T12:00:00.000Z";
        const { startDate, endDate } = getPeriodDate(0, testDate);

        expect(new Date(startDate).toISOString()).toBe(
            "2024-11-02T11:00:00.000Z"
        );
        expect(new Date(endDate).toISOString()).toBe(
            "2024-11-09T10:59:59.999Z"
        );
    });

    it("should use the default values if PERIOD_START_DAY and PERIOD_START_HOUR are not set", () => {
        const testDate = "2024-11-08T12:00:00.000Z";
        const { startDate, endDate } = getPeriodDate(0, testDate);

        expect(new Date(startDate).getUTCDay()).toBe(defaultStartDay);
        expect(new Date(startDate).getUTCHours()).toBe(defaultStartHour - 7);
    });

    it("should calculate the correct start and end dates when only PERIOD_START_DAY is set", () => {
        process.env.PERIOD_START_DAY = "5";
        const testDate = "2024-11-08T12:00:00.000Z";
        const { startDate, endDate } = getPeriodDate(0, testDate);

        expect(new Date(startDate).getUTCDay()).toBe(5);
        expect(new Date(startDate).getUTCHours()).toBe(defaultStartHour - 7);
    });

    it("should calculate the correct start and end dates when only PERIOD_START_HOUR is set", () => {
        process.env.PERIOD_START_HOUR = "15";
        const testDate = "2024-11-08T12:00:00.000Z";
        const { startDate, endDate } = getPeriodDate(0, testDate);

        expect(new Date(startDate).getUTCHours()).toBe(15 - 7);
        expect(new Date(startDate).getUTCDay()).toBe(defaultStartDay);
    });

    it("should calculate the correct start and end dates for future periods with default start day and hour", () => {
        const testDate = "2024-11-08T12:00:00.000Z";
        const { startDate, endDate } = getPeriodDate(2, testDate);

        expect(new Date(startDate).toISOString()).toBe(
            "2024-11-16T11:00:00.000Z"
        );
        expect(new Date(endDate).toISOString()).toBe(
            "2024-11-23T10:59:59.999Z"
        );
    });

    it("should calculate the correct start and end dates for past periods with default start day and hour", () => {
        const testDate = "2024-11-08T12:00:00.000Z";
        const { startDate, endDate } = getPeriodDate(-2, testDate);

        expect(new Date(startDate).toISOString()).toBe(
            "2024-10-19T11:00:00.000Z"
        );
        expect(new Date(endDate).toISOString()).toBe(
            "2024-10-26T10:59:59.999Z"
        );
    });

    it("should adjust periodStart to the previous week when wibDate is before the start of the current period", () => {
        const testDate = "2024-11-02T04:00:00.000Z";
        const { startDate, endDate } = getPeriodDate(0, testDate);

        expect(new Date(startDate).toISOString()).toBe(
            "2024-10-26T11:00:00.000Z"
        );
        expect(new Date(endDate).toISOString()).toBe(
            "2024-11-02T10:59:59.999Z"
        );
    });
});

describe("Utils - showFormattedDate", () => {
    it("should format a date correctly for a typical date", () => {
        const date = "2024-11-08T00:00:00.000Z";
        const formattedDate = showFormattedDate(date);

        expect(formattedDate).toBe("8 November 2024");
    });

    it("should format a date correctly for a date at the end of the year", () => {
        const date = "2024-12-31T00:00:00.000Z";
        const formattedDate = showFormattedDate(date);

        expect(formattedDate).toBe("31 Desember 2024");
    });

    it("should format a date correctly for a leap year date", () => {
        const date = "2024-02-29T00:00:00.000Z";
        const formattedDate = showFormattedDate(date);

        expect(formattedDate).toBe("29 Februari 2024");
    });

    it("should format a date correctly for a date at the start of the year", () => {
        const date = "2025-01-01T00:00:00.000Z";
        const formattedDate = showFormattedDate(date);

        expect(formattedDate).toBe("1 Januari 2025");
    });

    it("should handle invalid dates by returning 'Invalid Date'", () => {
        const invalidDate = "invalid-date";
        const formattedDate = showFormattedDate(invalidDate);

        expect(formattedDate).toBe("Invalid Date");
    });
});
