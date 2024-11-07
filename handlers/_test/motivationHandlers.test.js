const motivationHandlers = require("../motivationHandlers");
const motivationViews = require("../../views/motivation");
const fetch = require("node-fetch");

jest.mock("../../views/motivation");

const originalEnv = process.env;

describe("motivationHandlers", () => {
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

            const result = await motivationHandlers.handleMotivationRequest();

            expect(result).toEqual("Motivational message");
        });

        it("should throw an error if OPENROUTER_API_TOKEN is not found", async () => {
            process.env = {
                ...originalEnv,
                OPENROUTER_API_TOKEN: undefined,
            };

            await expect(
                motivationHandlers.handleMotivationRequest()
            ).rejects.toThrow(
                "OPENROUTER_API_TOKEN tidak ditemukan di file .env"
            );
        });

        it("should return an error view if the API request fails", async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                json: jest.fn().mockResolvedValueOnce({}),
            });

            const result = await motivationHandlers.handleMotivationRequest();

            expect(result).toEqual(motivationViews.error.request());
        });

        it("should return an error view if the API request throws an error", async () => {
            global.fetch.mockRejectedValue(new Error("API request failed"));

            const result = await motivationHandlers.handleMotivationRequest();

            expect(result).toEqual(motivationViews.error.request());
        });
    });
});
