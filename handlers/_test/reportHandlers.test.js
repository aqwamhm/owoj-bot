const reportHandlers = require("../reportHandlers");
const memberServices = require("../../services/member");
const reportServices = require("../../services/report");
const { getPeriodDate } = require("../../utils/date");
const { validate } = require("../../utils/validator");
const NotFoundError = require("../../exceptions/NotFoundError");
const ConflictError = require("../../exceptions/ConflictError");
const reportViews = require("../../views/report");

jest.mock("../../services/member");
jest.mock("../../services/report");
jest.mock("../../utils/date");
jest.mock("../../utils/validator");
jest.mock("../../views/error");
jest.mock("../../views/report");
jest.mock("../../views/member");
jest.mock("../../utils/juz");

describe("reportHandlers", () => {
    describe("handleCreateReport", () => {
        it("should create a terjemah report successfully", async () => {
            const message = {
                body: "/create-report Aqwam#terjemah",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "terjemah",
                previousPeriods: null,
            });
            memberServices.find.mockResolvedValue({
                name: "Aqwam",
                currentJuz: 1,
            });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportServices.find.mockResolvedValue(null);
            reportServices.create.mockResolvedValue(true);
            reportViews.success.create.mockReturnValue(
                "Terjemah report created successfully"
            );

            const result = await reportHandlers.handleCreateReport(
                message,
                validation
            );

            expect(result).toEqual("Terjemah report created successfully");
        });

        it("should create a murottal report successfully", async () => {
            const message = {
                body: "/create-report Aqwam#murottal",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "murottal",
                previousPeriods: null,
            });
            memberServices.find.mockResolvedValue({
                name: "Aqwam",
                currentJuz: 1,
            });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportServices.find.mockResolvedValue(null);
            reportServices.create.mockResolvedValue(true);
            reportViews.success.create.mockReturnValue(
                "Murottal report created successfully"
            );

            const result = await reportHandlers.handleCreateReport(
                message,
                validation
            );

            expect(result).toEqual("Murottal report created successfully");
        });

        it("should create a tilawah report successfully", async () => {
            const message = {
                body: "/create-report Aqwam#10/20",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: null,
            });
            memberServices.find.mockResolvedValue({
                name: "Aqwam",
                currentJuz: 1,
            });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportServices.find.mockResolvedValue(null);
            reportServices.create.mockResolvedValue(true);
            reportViews.success.create.mockReturnValue(
                "Tilawah report created successfully"
            );

            const result = await reportHandlers.handleCreateReport(
                message,
                validation
            );

            expect(result).toEqual("Tilawah report created successfully");
        });

        it("should throw NotFoundError if member does not exist", async () => {
            const message = {
                body: "/create-report Aqwam#terjemah",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "terjemah",
                previousPeriods: null,
            });
            memberServices.find.mockResolvedValue(null);

            await expect(
                reportHandlers.handleCreateReport(message, validation)
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw ConflictError if tilawah report pages conflict", async () => {
            const message = {
                body: "/create-report Aqwam#10/20",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: null,
            });
            memberServices.find.mockResolvedValue({
                name: "Aqwam",
                currentJuz: 1,
            });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportServices.find.mockResolvedValue({ pages: 10 });

            await expect(
                reportHandlers.handleCreateReport(message, validation)
            ).rejects.toThrow(ConflictError);
        });
    });

    describe("handleRemoveReport", () => {
        it("should remove a terjemah report successfully", async () => {
            const message = {
                body: "/remove-report Aqwam#terjemah",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "terjemah",
                previousPeriods: null,
            });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 20,
                totalPages: 20,
                type: "TERJEMAH",
            });
            reportServices.findMany.mockResolvedValue([
                { name: "Aqwam", pages: 20, totalPages: 20, type: "TERJEMAH" },
            ]);
            reportServices.delete.mockResolvedValue(true);
            reportViews.success.remove.mockReturnValue(
                "Terjemah report removed successfully"
            );

            const result = await reportHandlers.handleRemoveReport(
                message,
                validation
            );

            expect(result).toEqual("Terjemah report removed successfully");
        });

        it("should remove a murottal report successfully", async () => {
            const message = {
                body: "/remove-report Aqwam#murottal",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "murottal",
                previousPeriods: null,
            });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 20,
                totalPages: 20,
                type: "MUROTTAL",
            });
            reportServices.findMany.mockResolvedValue([
                { name: "Aqwam", pages: 20, totalPages: 20, type: "MUROTTAL" },
            ]);
            reportServices.delete.mockResolvedValue(true);
            reportViews.success.remove.mockReturnValue(
                "Murottal report removed successfully"
            );

            const result = await reportHandlers.handleRemoveReport(
                message,
                validation
            );

            expect(result).toEqual("Murottal report removed successfully");
        });

        it("should remove a tilawah report successfully", async () => {
            const message = {
                body: "/remove-report Aqwam#10/20",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: null,
            });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 10,
                totalPages: 20,
                type: "TILAWAH",
            });
            reportServices.findMany.mockResolvedValue([
                { name: "Aqwam", pages: 10, totalPages: 20, type: "TILAWAH" },
            ]);
            reportServices.delete.mockResolvedValue(true);
            reportViews.success.remove.mockReturnValue(
                "Tilawah report removed successfully"
            );

            const result = await reportHandlers.handleRemoveReport(
                message,
                validation
            );

            expect(result).toEqual("Tilawah report removed successfully");
        });

        it("should throw NotFoundError if report does not exist", async () => {
            const message = {
                body: "/remove-report Aqwam#terjemah",
                id: { remote: "groupId123" },
            };
            const validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "terjemah",
                previousPeriods: null,
            });
            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportServices.find.mockResolvedValue(null);

            await expect(
                reportHandlers.handleRemoveReport(message, validation)
            ).rejects.toThrow(NotFoundError);
        });
    });
});
