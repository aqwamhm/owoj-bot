const UtilityHandler = require("../UtilityHandler");
const utilityViews = require("../../views/utility");
const NotFoundError = require("../../exceptions/NotFoundError");
const errorMessages = require("../../views/error");
const { validate } = require("../../utils/validator");

jest.mock("../../views/utility");
jest.mock("../../views/error");
jest.mock("../../utils/validator");

const originalEnv = process.env;

describe("UtilityHandler", () => {
    beforeEach(() => {
        process.env = { ...originalEnv, OPENROUTER_API_TOKEN: "mock-api-key" };
        global.fetch = jest.fn();
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    describe("handleMotivationRequest", () => {
        it("should return a motivational message successfully", async () => {
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: "Motivational message",
                        },
                    },
                ],
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            });

            const result = await UtilityHandler.handleMotivationRequest();

            expect(result).toEqual("Motivational message");
        });

        it("should throw an error if OPENROUTER_API_TOKEN is not found", async () => {
            process.env = {
                ...originalEnv,
                OPENROUTER_API_TOKEN: undefined,
            };

            await expect(
                UtilityHandler.handleMotivationRequest()
            ).rejects.toThrow(
                "OPENROUTER_API_TOKEN tidak ditemukan di file .env"
            );
        });

        it("should return an error view if the API request fails", async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                json: jest.fn().mockResolvedValueOnce({}),
            });

            const result = await UtilityHandler.handleMotivationRequest();

            expect(result).toEqual(utilityViews.motivation.error.request());
        });

        it("should return an error view if the API request throws an error", async () => {
            global.fetch.mockRejectedValue(new Error("API request failed"));

            const result = await UtilityHandler.handleMotivationRequest();

            expect(result).toEqual(utilityViews.motivation.error.request());
        });
    });

    describe("handlePrayerTimeRequest", () => {
        const mockValidation = {};

        const mockLocationResponse = {
            data: [
                {
                    id: "1301",
                    lokasi: "KOTA JAKARTA",
                },
            ],
        };

        const mockPrayerTimeResponse = {
            data: {
                jadwal: {
                    subuh: "04:31",
                    dzuhur: "11:54",
                    ashar: "15:13",
                    maghrib: "17:59",
                    isya: "19:09",
                },
            },
        };

        function getExpectedDate(daysString) {
            const days = parseInt(daysString, 10) || 0;
            const date = new Date();
            date.setDate(date.getDate() + days);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }

        it("should return prayer times for today when days are not specified", async () => {
            const message = { body: "/waktu-sholat Kota Jakarta" };
            validate.mockReturnValue({
                location: "Kota Jakarta",
                days: undefined,
            });

            const expectedDate = getExpectedDate(undefined);

            global.fetch
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValueOnce(mockLocationResponse),
                })
                .mockResolvedValueOnce({
                    json: jest
                        .fn()
                        .mockResolvedValueOnce(mockPrayerTimeResponse),
                });

            const result = await UtilityHandler.handlePrayerTimeRequest(
                message,
                mockValidation
            );

            expect(result).toEqual(
                utilityViews.prayerTime.success({
                    prayerTime: mockPrayerTimeResponse.data,
                })
            );
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining(`jadwal/1301/${expectedDate}`)
            );
        });

        it("should return prayer times for tomorrow when days is '1'", async () => {
            const message = { body: "/waktu-sholat Kota Jakarta 1" };
            validate.mockReturnValue({ location: "Kota Jakarta", days: "1" });

            const expectedDate = getExpectedDate("1");

            global.fetch
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValueOnce(mockLocationResponse),
                })
                .mockResolvedValueOnce({
                    json: jest
                        .fn()
                        .mockResolvedValueOnce(mockPrayerTimeResponse),
                });

            const result = await UtilityHandler.handlePrayerTimeRequest(
                message,
                mockValidation
            );

            expect(result).toEqual(
                utilityViews.prayerTime.success({
                    prayerTime: mockPrayerTimeResponse.data,
                })
            );
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining(`jadwal/1301/${expectedDate}`)
            );
        });

        it("should format location correctly with Kabupaten", async () => {
            const message = { body: "/waktu-sholat Kabupaten Bandung" };
            validate.mockReturnValue({
                location: "Kabupaten Bandung",
                days: undefined,
            });

            const expectedDate = getExpectedDate(undefined);

            global.fetch
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValueOnce({
                        data: [
                            {
                                id: "1201",
                                lokasi: "KAB. BANDUNG",
                            },
                        ],
                    }),
                })
                .mockResolvedValueOnce({
                    json: jest
                        .fn()
                        .mockResolvedValueOnce(mockPrayerTimeResponse),
                });

            const result = await UtilityHandler.handlePrayerTimeRequest(
                message,
                mockValidation
            );

            expect(result).toEqual(
                utilityViews.prayerTime.success({
                    prayerTime: mockPrayerTimeResponse.data,
                })
            );
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining(`kota/cari/KAB.%20BANDUNG`)
            );
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining(`jadwal/1201/${expectedDate}`)
            );
        });

        it("should throw NotFoundError if location is not found", async () => {
            const message = { body: "/waktu-sholat NonExistentLocation" };
            validate.mockReturnValue({
                location: "NonExistentLocation",
                days: undefined,
            });

            global.fetch.mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce({ data: [] }),
            });

            await expect(
                UtilityHandler.handlePrayerTimeRequest(message, mockValidation)
            ).rejects.toThrow(NotFoundError);
            expect(
                utilityViews.prayerTime.error.locationNotFound
            ).toHaveBeenCalled();
        });

        it("should handle prayer time API errors", async () => {
            const message = { body: "/waktu-sholat Kota Jakarta" };
            validate.mockReturnValue({
                location: "Kota Jakarta",
                days: undefined,
            });

            global.fetch
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValueOnce(mockLocationResponse),
                })
                .mockRejectedValueOnce(new Error("Prayer time API error"));

            await expect(
                UtilityHandler.handlePrayerTimeRequest(message, mockValidation)
            ).rejects.toThrow("Prayer time API error");
        });

        it("should return prayer times for today when days is invalid 'abc'", async () => {
            const message = { body: "/waktu-sholat Kota Jakarta abc" };
            validate.mockReturnValue({ location: "Kota Jakarta", days: "abc" });

            const expectedDate = getExpectedDate("abc");

            global.fetch
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValueOnce(mockLocationResponse),
                })
                .mockResolvedValueOnce({
                    json: jest
                        .fn()
                        .mockResolvedValueOnce(mockPrayerTimeResponse),
                });

            const result = await UtilityHandler.handlePrayerTimeRequest(
                message,
                mockValidation
            );

            expect(result).toEqual(
                utilityViews.prayerTime.success({
                    prayerTime: mockPrayerTimeResponse.data,
                })
            );
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining(`jadwal/1301/${expectedDate}`)
            );
        });

        it("should handle large days values '365'", async () => {
            const message = { body: "/waktu-sholat Kota Jakarta 365" };
            validate.mockReturnValue({ location: "Kota Jakarta", days: "365" });

            const expectedDate = getExpectedDate("365");

            global.fetch
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValueOnce(mockLocationResponse),
                })
                .mockResolvedValueOnce({
                    json: jest
                        .fn()
                        .mockResolvedValueOnce(mockPrayerTimeResponse),
                });

            const result = await UtilityHandler.handlePrayerTimeRequest(
                message,
                mockValidation
            );

            expect(result).toEqual(
                utilityViews.prayerTime.success({
                    prayerTime: mockPrayerTimeResponse.data,
                })
            );
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining(`jadwal/1301/${expectedDate}`)
            );
        });
    });
});
