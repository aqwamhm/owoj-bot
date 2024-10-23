const { getPeriodDate } = require("../utils/hepler");

const memberListWithReport = ({ members, periods }) => {
    let result = "";
    const { startDate: currentPeriodStartDate, endDate: currentPeriodEndDate } =
        getPeriodDate();

    const previousPeriods = periods.filter((period) => {
        return (
            period.startDate.toISOString() !== currentPeriodStartDate &&
            period.endDate.toISOString() !== currentPeriodEndDate
        );
    });

    const formatPages = (reports) => {
        return reports
            .map((report) => report.pages)
            .sort((a, b) => a - b)
            .join(", ");
    };

    for (let i = 1; i <= 30; i++) {
        const member = members.find((m) => m.currentJuz === i);

        if (member) {
            const currentPeriodReports = member.reports.filter((report) => {
                return (
                    report.periodStartDate.toISOString() ==
                    currentPeriodStartDate
                );
            });

            result += `${i}. ${member.name}: ${formatPages(
                currentPeriodReports
            )}\n`;

            previousPeriods.forEach((period) => {
                const previousPeriodReports = member.reports.filter(
                    (report) => {
                        return (
                            report.periodStartDate.toISOString() ===
                            period.startDate.toISOString()
                        );
                    }
                );

                if (
                    previousPeriodReports.length > 0 &&
                    previousPeriodReports.every((report) => report.pages !== 20)
                ) {
                    result += `\t ↪️ ${previousPeriodReports[0].juz}. ${
                        member.name
                    }: ${formatPages(previousPeriodReports)}\n`;
                }
            });
        } else {
            result += `${i}. ---\n`;
        }
    }

    return result;
};

module.exports = { memberListWithReport };
