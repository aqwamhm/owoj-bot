const {
    getPeriodDate,
    showFormattedDate,
    daysOfWeek,
} = require("../utils/date");
const { formatName } = require("../utils/name");
const { formatPhoneNumber } = require("../utils/phone");
const { numberToEmoji } = require("../utils/number");

const memberListWithReport = ({ members, periods, group }) => {
    const { startDate: currentPeriodStartDate, endDate: currentPeriodEndDate } =
        getPeriodDate();
    const reportDeadline = `${daysOfWeek[process.env.PERIOD_START_DAY]}, ${
        process.env.PERIOD_START_HOUR - 1
    }:59`;

    let result = `بسم الله الرحمن الرحيم

*REKAP OWOJ ${numberToEmoji(group.number)} on WA*

- *Kordinator:* 👨‍🏫 Sutomo Budi Santoso
- *Bot Developer:* 👨‍💻 Aqwam Hizbal Muhshiy
${
    group?.admin?.name
        ? `- *Admin Grup:* 👤 ${formatName(group.admin.name)}\n`
        : ""
}
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

const uncompletedMemberList = ({ members, periods }) => {
    const { startDate: currentPeriodStartDate, endDate: currentPeriodEndDate } =
        getPeriodDate();
    const reportDeadline = `${daysOfWeek[process.env.PERIOD_START_DAY]} ${
        process.env.PERIOD_START_HOUR
    }:00`;

    let resultHeader = `*Daftar peserta dan juz yang belum khalas:*\n\n`;
    let resultBody = "";

    const previousPeriods = periods.filter(
        (period) =>
            period.startDate.toISOString() !== currentPeriodStartDate ||
            period.endDate.toISOString() !== currentPeriodEndDate
    );

    for (let i = 1; i <= 30; i++) {
        const member = members.find((m) => m.currentJuz === i);

        if (member) {
            const currentPeriodReports = member.reports.filter(
                (report) =>
                    report.periodStartDate.toISOString() ===
                    currentPeriodStartDate
            );

            const hasCompletedReport = currentPeriodReports.some(
                (report) =>
                    report.pages === report.totalPages && report.pages > 0
            );

            if (!hasCompletedReport) {
                resultBody += `${member.currentJuz}. ${formatName(
                    member.name
                )}\n`;

                previousPeriods.forEach((period) => {
                    const previousPeriodReports = member.reports.filter(
                        (report) =>
                            report.periodStartDate.toISOString() ===
                            period.startDate.toISOString()
                    );

                    if (
                        previousPeriodReports.length > 0 &&
                        previousPeriodReports.every(
                            (report) =>
                                report.pages < report.totalPages ||
                                report.pages === 0
                        )
                    ) {
                        const previousReport = previousPeriodReports[0];
                        resultBody += `    ↪️ ${
                            previousReport.juz
                        }. ${formatName(member.name)}\n`;
                    }
                });
            }
        }
    }

    if (resultBody === "") {
        return "Alhamdulillah, seluruh peserta sudah khalas ✅";
    } else {
        let result =
            resultHeader +
            resultBody +
            `\nDiharapkan kepada seluruh peserta yang tercantum di atas untuk segera membuat laporan khalas sebelum ${reportDeadline} agar tidak tercatat sebagai hutang di periode berikutnya.`;
        return result;
    }
};

const adminList = ({ admins }) => {
    let result = `*Daftar admin yang terdaftar di sistem robot:*\n\n`;

    admins.forEach((admin) => {
        result += `- ${formatName(admin.name)} - ${formatPhoneNumber(
            admin.phoneNumber
        )}\n`;
    });

    result += `\n\n*Total Admin:* ${numberToEmoji(admins.length)}`;

    return result;
};

const groupList = ({ groups }) => {
    let groupCount = 0;
    let memberCount = 0;
    let result = `*Daftar grup yang terdaftar di sistem robot:*\n\n`;

    groups.forEach((group) => {
        groupCount++;
        memberCount += group._count.members;
        result += `- *OWOJ ${numberToEmoji(group.number)}:* ${
            group._count.members
        } Peserta\n`;
    });

    result += `\n*Total Grup:* ${numberToEmoji(
        groupCount
    )}\n*Total Peserta:* ${numberToEmoji(memberCount)}`;

    return result;
};

module.exports = {
    memberListWithReport,
    uncompletedMemberList,
    adminList,
    groupList,
};
