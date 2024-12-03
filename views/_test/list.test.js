const {
    memberListWithReport,
    uncompletedMemberList,
    adminList,
    groupList,
} = require("../list");

const {
    getPeriodDate,
    showFormattedDate,
    daysOfWeek,
} = require("../../utils/date");

jest.mock("../../utils/date", () => ({
    getPeriodDate: jest.fn(),
    showFormattedDate: jest.fn(),
    daysOfWeek: [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
    ],
}));

jest.mock("../../utils/phone", () => ({
    formatPhoneNumber: jest.fn().mockReturnValue("Formatted phone number"),
}));

describe("memberListWithReport", () => {
    const periods = [
        {
            startDate: new Date("2024-11-02"),
            endDate: new Date("2024-11-09"),
        },
        {
            startDate: new Date("2024-10-26"),
            endDate: new Date("2024-11-02"),
        },
        {
            startDate: new Date("2024-10-19"),
            endDate: new Date("2024-10-26"),
        },
    ];

    beforeEach(() => {
        getPeriodDate.mockReturnValue({
            startDate: new Date("2024-11-02").toISOString(),
            endDate: new Date("2024-11-09").toISOString(),
        });

        process.env.PERIOD_START_DAY = "6";
        process.env.PERIOD_START_HOUR = "18";
    });

    afterEach(() => {
        delete process.env.PERIOD_START_DAY;
        delete process.env.PERIOD_START_HOUR;
    });

    it("should generate the report header correctly", () => {
        const result = memberListWithReport({
            group: { number: 1 },
            members: [],
            periods,
        });

        expect(result).toContain("OWOJ 1");
        expect(showFormattedDate).toHaveBeenNthCalledWith(
            1,
            periods[0].startDate.toISOString()
        );
        expect(showFormattedDate).toHaveBeenNthCalledWith(
            2,
            periods[0].endDate.toISOString()
        );
        expect(result).toContain(
            `*Batas Akhir Laporan:* ${
                daysOfWeek[process.env.PERIOD_START_DAY]
            }, ${process.env.PERIOD_START_HOUR - 1}:59`
        );
    });

    it("should display correct juz for each member", () => {
        const result = memberListWithReport({
            group: { number: 1 },
            members: [
                {
                    name: "Aqwam",
                    currentJuz: 1,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 1,
                            pages: 10,
                            totalPages: 20,
                            type: "TILAWAH",
                        },
                    ],
                },
                {
                    name: "Aqsath",
                    currentJuz: 2,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 2,
                            pages: 10,
                            totalPages: 20,
                            type: "TILAWAH",
                        },
                    ],
                },
                {
                    name: "Mary",
                    currentJuz: 3,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 3,
                            pages: 10,
                            totalPages: 20,
                            type: "TILAWAH",
                        },
                    ],
                },
            ],
            periods: [
                {
                    startDate: new Date("2024-11-02"),
                    endDate: new Date("2024-11-09"),
                },
            ],
        });

        expect(result).toContain("1. Aqwam");
        expect(result).toContain("2. Aqsath");
        expect(result).toContain("3. Mary");
    });

    it("should display empty members in the list correctly", () => {
        const result = memberListWithReport({
            group: { number: 1 },
            members: [],
            periods: [
                {
                    startDate: new Date("2024-11-02"),
                    endDate: new Date("2024-11-09"),
                },
            ],
        });

        for (let i = 1; i <= 30; i++) {
            expect(result).toContain(`${i}. ---`);
        }
    });

    it("should display member's reports correctly", () => {
        const result = memberListWithReport({
            group: { number: 1 },
            members: [
                {
                    name: "Aqwam",
                    currentJuz: 1,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 1,
                            pages: 10,
                            totalPages: 20,
                            type: "TILAWAH",
                        },
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 1,
                            pages: 5,
                            totalPages: 20,
                            type: "TILAWAH",
                        },
                    ],
                },
                {
                    name: "Ivo",
                    currentJuz: 2,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 1,
                            pages: 5,
                            totalPages: 20,
                            type: "TERJEMAH",
                        },
                    ],
                },
                {
                    name: "Melni",
                    currentJuz: 3,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 3,
                            pages: 10,
                            totalPages: 20,
                            type: "MUROTTAL",
                        },
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 1,
                            pages: 5,
                            totalPages: 20,
                            type: "MUROTTAL",
                        },
                    ],
                },
            ],
            periods: [
                {
                    startDate: new Date("2024-11-02"),
                    endDate: new Date("2024-11-09"),
                },
            ],
        });

        expect(result).toContain("Aqwam: 5, 10 / 20");
        expect(result).toContain("Ivo: 5 / 20 📖");
        expect(result).toContain("Melni: 5, 10 / 20 🎧");
    });

    it("should display khalas report with emoji correctly", () => {
        const result = memberListWithReport({
            group: { number: 1 },
            members: [
                {
                    name: "Aqwam",
                    currentJuz: 1,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 1,
                            pages: 21,
                            totalPages: 21,
                            type: "TILAWAH",
                        },
                    ],
                },
                {
                    name: "Ivo",
                    currentJuz: 2,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 1,
                            pages: 16,
                            totalPages: 16,
                            type: "TERJEMAH",
                        },
                    ],
                },
                {
                    name: "Melni",
                    currentJuz: 3,
                    reports: [
                        {
                            periodStartDate: new Date("2024-11-02"),
                            periodEndDate: new Date("2024-11-09"),
                            juz: 3,
                            pages: 20,
                            totalPages: 20,
                            type: "MUROTTAL",
                        },
                    ],
                },
            ],
            periods: [
                {
                    startDate: new Date("2024-11-02"),
                    endDate: new Date("2024-11-09"),
                },
            ],
        });

        expect(result).toContain("Aqwam: 21 / 21 ✅");
        expect(result).toContain("Ivo: 16 / 16 📖 ✅");
        expect(result).toContain("Melni: 20 / 20 🎧 ✅");
    });

    it("should display previous period reports correctly", () => {
        const result = memberListWithReport({
            group: { number: 1 },
            members: [
                {
                    name: "Aqwam",
                    currentJuz: 1,
                    reports: [
                        {
                            periodStartDate: periods[1].startDate,
                            periodEndDate: periods[1].endDate,
                            juz: 30,
                            pages: 10,
                            totalPages: 20,
                            type: "TILAWAH",
                        },
                        {
                            periodStartDate: periods[2].startDate,
                            periodEndDate: periods[2].endDate,
                            juz: 29,
                            pages: 0,
                            totalPages: 0,
                            type: "TILAWAH",
                        },
                    ],
                },
            ],
            periods,
        });

        expect(result).toContain("↪️ 30. Aqwam: 10 / 20");
        expect(result).toContain("↪️ 29. Aqwam:");
    });

    it("should display weekly champions correctly", () => {
        const result = memberListWithReport({
            group: { number: 1 },
            members: [
                {
                    name: "Aqwam",
                    currentJuz: 1,
                    reports: [
                        {
                            periodStartDate: periods[0].startDate,
                            periodEndDate: periods[0].endDate,
                            juz: 1,
                            pages: 20,
                            totalPages: 20,
                            type: "TILAWAH",
                            updatedAt: new Date("2024-11-02T15:23:45"),
                        },
                    ],
                },
                {
                    name: "Ivo",
                    currentJuz: 2,
                    reports: [
                        {
                            periodStartDate: periods[0].startDate,
                            periodEndDate: periods[0].endDate,
                            juz: 1,
                            pages: 20,
                            totalPages: 20,
                            type: "TERJEMAH",
                            updatedAt: new Date("2024-11-03T15:23:45"),
                        },
                    ],
                },
                {
                    name: "Melni",
                    currentJuz: 3,
                    reports: [
                        {
                            periodStartDate: periods[0].startDate,
                            periodEndDate: periods[0].endDate,
                            juz: 3,
                            pages: 20,
                            totalPages: 20,
                            type: "MUROTTAL",
                            updatedAt: new Date("2024-11-04T15:23:45"),
                        },
                    ],
                },
                {
                    name: "Mary",
                    currentJuz: 4,
                    reports: [
                        {
                            periodStartDate: periods[0].startDate,
                            periodEndDate: periods[0].endDate,
                            juz: 4,
                            pages: 20,
                            totalPages: 20,
                            type: "TILAWAH",
                            updatedAt: new Date("2024-11-05T15:23:45"),
                        },
                    ],
                },
            ],
            periods,
        });

        expect(result).toContain("*🏆 Juara Mingguan 🏆*");
        expect(result).toContain("1. Aqwam 🥇");
        expect(result).toContain("2. Ivo 🥈");
        expect(result).toContain("3. Melni 🥉");
    });
});

describe("uncompletedMemberList", () => {
    const periods = [
        {
            startDate: new Date("2024-11-02"),
            endDate: new Date("2024-11-09"),
        },
        {
            startDate: new Date("2024-10-26"),
            endDate: new Date("2024-11-02"),
        },
        {
            startDate: new Date("2024-10-19"),
            endDate: new Date("2024-10-26"),
        },
    ];

    beforeEach(() => {
        getPeriodDate.mockReturnValue({
            startDate: new Date("2024-11-02").toISOString(),
            endDate: new Date("2024-11-09").toISOString(),
        });

        process.env.PERIOD_START_DAY = "6";
        process.env.PERIOD_START_HOUR = "18";
    });

    afterEach(() => {
        delete process.env.PERIOD_START_DAY;
        delete process.env.PERIOD_START_HOUR;
    });

    it("should list members who haven't completed their reports", () => {
        const members = [
            {
                name: "Aqwam",
                currentJuz: 1,
                reports: [
                    {
                        periodStartDate: new Date("2024-11-02"),
                        periodEndDate: new Date("2024-11-09"),
                        juz: 1,
                        pages: 10,
                        totalPages: 20,
                        type: "TILAWAH",
                    },
                ],
            },
            {
                name: "Ivo",
                currentJuz: 2,
                reports: [
                    {
                        periodStartDate: new Date("2024-11-02"),
                        periodEndDate: new Date("2024-11-09"),
                        juz: 2,
                        pages: 5,
                        totalPages: 20,
                        type: "TILAWAH",
                    },
                ],
            },
        ];

        const result = uncompletedMemberList({ members, periods });

        expect(result).toContain("*Daftar peserta dan juz yang belum khalas:*");
        expect(result).toContain("1. Aqwam");
        expect(result).toContain("2. Ivo");
        expect(result).toContain(
            "Diharapkan kepada seluruh peserta yang tercantum di atas untuk segera membuat laporan khalas sebelum Sabtu 18:00"
        );
    });

    it("should indicate no members are uncompleted", () => {
        const members = [
            {
                name: "Aqwam",
                currentJuz: 1,
                reports: [
                    {
                        periodStartDate: new Date("2024-11-02"),
                        periodEndDate: new Date("2024-11-09"),
                        juz: 1,
                        pages: 20,
                        totalPages: 20,
                        type: "TILAWAH",
                    },
                ],
            },
            {
                name: "Ivo",
                currentJuz: 2,
                reports: [
                    {
                        periodStartDate: new Date("2024-11-02"),
                        periodEndDate: new Date("2024-11-09"),
                        juz: 2,
                        pages: 20,
                        totalPages: 20,
                        type: "TILAWAH",
                    },
                ],
            },
        ];

        const result = uncompletedMemberList({ members, periods });

        expect(result).toBe("Alhamdulillah, seluruh peserta sudah khalas ✅");
    });

    it("should include previous period reports for uncompleted members", () => {
        const members = [
            {
                name: "Aqwam",
                currentJuz: 1,
                reports: [
                    {
                        periodStartDate: new Date("2024-11-02"),
                        periodEndDate: new Date("2024-11-09"),
                        juz: 1,
                        pages: 10,
                        totalPages: 20,
                        type: "TILAWAH",
                    },
                    {
                        periodStartDate: new Date("2024-10-26"),
                        periodEndDate: new Date("2024-11-02"),
                        juz: 30,
                        pages: 0,
                        totalPages: 0,
                        type: "TILAWAH",
                    },
                ],
            },
        ];

        const result = uncompletedMemberList({ members, periods });

        expect(result).toContain("1. Aqwam");
        expect(result).toContain("    ↪️ 30. Aqwam");
    });
});

describe("adminList", () => {
    it("should generate the admin list correctly", () => {
        const testAdmins = [
            { name: "Ivo", phoneNumber: "128937981" },
            { name: "Aqwam", phoneNumber: "123456789" },
            { name: "Budi", phoneNumber: "716318673" },
        ];

        const result = adminList({ admins: testAdmins });

        expect(result).toContain(
            "*Daftar admin yang terdaftar di sistem robot:*"
        );
        expect(result).toContain("Aqwam - Formatted phone number");
        expect(result).toContain("Budi - Formatted phone number");
        expect(result).toContain("Ivo - Formatted phone number");
    });
});

describe("groupList", () => {
    it("should generate the group list correctly", () => {
        const result = groupList({
            groups: [
                {
                    id: "id-1",
                    number: 1,
                    _count: {
                        members: 5,
                    },
                },
                {
                    id: "id-2",
                    number: 2,
                    _count: {
                        members: 10,
                    },
                },
                {
                    id: "id-3",
                    number: 3,
                    _count: {
                        members: 20,
                    },
                },
            ],
        });

        expect(result).toContain("OWOJ 1: 5");
        expect(result).toContain("OWOJ 2: 10");
        expect(result).toContain("OWOJ 3: 20");
    });
});
