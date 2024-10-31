const {
    getPeriodDate,
    showFormattedDate,
    daysOfWeek,
} = require("../utils/date");
const { formatName } = require("../utils/name");

const memberListWithReport = ({ members, periods }) => {
    const { startDate: currentPeriodStartDate, endDate: currentPeriodEndDate } =
        getPeriodDate();
    const reportDeadline = `${daysOfWeek[process.env.PERIOD_START_DAY]} ${
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
        return reports
            .filter((report) => report.pages > 0)
            .sort((a, b) => {
                return new Date(a.createdAt) - new Date(b.createdAt);
            })
            .map((report) => {
                if (report.type == "MUROTTAL") {
                    return `🎧 ✅`;
                } else if (report.type == "TERJEMAH") {
                    return `📖 ✅`;
                } else {
                    return report.pages >= 20
                        ? `${report.pages} ✅`
                        : report.pages;
                }
            })
            .join(", ");
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

            const completed20Pages = currentPeriodReports.some(
                (report) => report.pages >= 20
            );

            if (completed20Pages) {
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
                    previousPeriodReports.every((report) => report.pages < 20)
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
                    currentPeriodStartDate && report.pages >= 20
        );
        const reportB = b.reports.find(
            (report) =>
                report.periodStartDate.toISOString() ===
                    currentPeriodStartDate && report.pages >= 20
        );
        return new Date(reportA.createdAt) - new Date(reportB.createdAt);
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
- ✅: Khalas (20 halaman+)
- ↪️: Belum khalas periode sebelumnya
- 🎧: Laporan murottal (peserta wanita berhalangan)
- 📖: Laporan terjemah (peserta wanita berhalangan)
`;

    return result;
};

module.exports = { memberListWithReport };
