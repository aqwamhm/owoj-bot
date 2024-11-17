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
        const mockMessage = {
            body: "/waktu-sholat Kota Jakarta",
        };

        const mockValidation = {
            location: "Kota Jakarta",
        };

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

        it("should return prayer times successfully", async () => {
            validate.mockReturnValue({ location: "Kota Jakarta" });

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
                mockMessage,
                mockValidation
            );

            expect(result).toEqual(
                utilityViews.prayerTime.success({
                    prayerTime: mockPrayerTimeResponse.data,
                })
            );
        });

        it("should throw NotFoundError if location is not found", async () => {
            validate.mockReturnValue({ location: "Kota Jakarta" });

            global.fetch.mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce({ data: [] }),
            });

            await expect(
                UtilityHandler.handlePrayerTimeRequest(
                    mockMessage,
                    mockValidation
                )
            ).rejects.toThrow(NotFoundError);

            expect(
                utilityViews.prayerTime.error.locationNotFound
            ).toHaveBeenCalled();
        });

        it("should format location correctly", async () => {
            const messageWithKabupaten = {
                body: "/waktu-sholat Kabupaten Bandung",
            };

            validate.mockReturnValue({ location: "Kabupaten Bandung" });

            global.fetch
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValueOnce(mockLocationResponse),
                })
                .mockResolvedValueOnce({
                    json: jest
                        .fn()
                        .mockResolvedValueOnce(mockPrayerTimeResponse),
                });

            await UtilityHandler.handlePrayerTimeRequest(
                messageWithKabupaten,
                mockValidation
            );

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("KAB.%20BANDUNG")
            );
        });

        it("should handle prayer time API errors", async () => {
            validate.mockReturnValue({ location: "Kota Jakarta" });

            global.fetch
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValueOnce(mockLocationResponse),
                })
                .mockRejectedValueOnce(new Error("Prayer time API error"));

            await expect(
                UtilityHandler.handlePrayerTimeRequest(
                    mockMessage,
                    mockValidation
                )
            ).rejects.toThrow("Prayer time API error");
        });
    });
});
