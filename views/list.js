const {
    getPeriodDate,
    showFormattedDate,
    daysOfWeek,
} = require("../utils/date");
const { formatName } = require("../utils/name");

const memberListWithReport = ({ members, periods }) => {
    const { startDate: currentPeriodStartDate, endDate: currentPeriodEndDate } =
        getPeriodDate();
    const reportDeadline = `${daysOfWeek[process.env.PERIOD_START_DAY]}, ${
        process.env.PERIOD_START_HOUR - 1
    }:59`;

    let result = `بسم الله الرحمن الرحيم

*REKAP OWOJ on WA*

- *Kordinator:* 👨‍🏫 Sutomo Budi Santoso
- *Bot Developer:* 👨‍💻 Aqwam Hizbal Muhshiy
- *Periode:* ${showFormattedDate(currentPeriodStartDate)} - ${showFormattedDate(
        currentPeriodEndDate
    )}
- *Batas Akhir Laporan:* ${reportDeadline}

`;

    const previousPeriods = periods.filter((period) => {
        return (
            period.startDate.toISOString() !== currentPeriodStartDate &&
            period.endDate.toISOString() !== currentPeriodEndDate
        );
    });

    const formatPages = (reports) => {
        // Filter reports with pages > 0
        const filteredReports = reports.filter((report) => report.pages > 0);

        // Sort reports by pages
        filteredReports.sort((a, b) => parseInt(a.pages) - parseInt(b.pages));

        // Map over the filtered reports
        const result = filteredReports
            .map((report, index) => {
                let formattedResult = report.pages;

                // Check if it's the last report in the filtered list
                if (index === filteredReports.length - 1) {
                    let typeEmoji = " ";

                    if (report.type === "TERJEMAH") {
                        typeEmoji = " 📖 ";
                    } else if (report.type === "MUROTTAL") {
                        typeEmoji = " 🎧 ";
                    }

                    formattedResult += ` / ${report.totalPages}${typeEmoji}${
                        report.pages === report.totalPages ? "✅" : ""
                    }`;
                }

                return formattedResult;
            })
            .join(", "); // Join results with a comma

        return result;
    };

    const champions = [];
    let completedCount = 0;
    let inProgressCount = 0;

    for (let i = 1; i <= 30; i++) {
        const member = members.find((m) => m.currentJuz === i);

        if (member) {
            const currentPeriodReports = member.reports.filter((report) => {
                return (
                    report.periodStartDate.toISOString() ===
                    currentPeriodStartDate
                );
            });

            const completed = currentPeriodReports.some(
                (report) =>
                    report.pages == report.totalPages && report.pages > 0
            );

            if (completed) {
                champions.push(member);
                completedCount++;
            } else {
                inProgressCount++;
            }

            result += `${i}. ${formatName(member.name)}: ${formatPages(
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
                    previousPeriodReports.every(
                        (report) =>
                            report.pages < report.totalPages ||
                            report.totalPages === 0
                    )
                ) {
                    result += `   ↪️ ${
                        previousPeriodReports[0].juz
                    }. ${formatName(member.name)}: ${formatPages(
                        previousPeriodReports
                    )}\n`;
                }
            });
        } else {
            result += `${i}. ---\n`;
        }
    }

    champions.sort((a, b) => {
        const reportA = a.reports.find(
            (report) =>
                report.periodStartDate.toISOString() ===
                    currentPeriodStartDate && report.pages == report.totalPages
        );
        const reportB = b.reports.find(
            (report) =>
                report.periodStartDate.toISOString() ===
                    currentPeriodStartDate && report.pages == report.totalPages
        );
        return new Date(reportA.updatedAt) - new Date(reportB.updatedAt);
    });

    const topChampions = champions.slice(0, 3);
    result += "\n*🏆 Juara Mingguan 🏆*\n";

    const medals = ["🥇", "🥈", "🥉"];
    for (let i = 0; i < 3; i++) {
        result += `${i + 1}. `;
        if (topChampions[i]) {
            result += `${formatName(topChampions[i].name)} ${medals[i]}\n`;
        } else {
            result += `---\n`;
        }
    }

    result += `\n*✅ Khalas:* ${completedCount}\n`;
    result += `*🔄 Dalam Progres:* ${inProgressCount}\n`;

    result += `
    
*Keterangan:*
- ✅: Khalas (halaman dibaca = total halaman)
- ↪️: Belum khalas periode sebelumnya
- 🎧: Laporan murottal (peserta wanita berhalangan)
- 📖: Laporan terjemah (peserta wanita berhalangan)
`;

    return result;
};

module.exports = { memberListWithReport };
