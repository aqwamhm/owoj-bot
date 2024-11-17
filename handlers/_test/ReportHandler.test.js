const ReportHandler = require("../ReportHandler");
const memberServices = require("../../services/member");
const reportServices = require("../../services/report");
const { getPeriodDate } = require("../../utils/date");
const { validate } = require("../../utils/validator");
const { decrementJuz } = require("../../utils/juz");
const NotFoundError = require("../../exceptions/NotFoundError");
const reportViews = require("../../views/report");
const ConflictError = require("../../exceptions/ConflictError");

jest.mock("../../services/member");
jest.mock("../../services/report");
jest.mock("../../utils/date");
jest.mock("../../utils/validator");
jest.mock("../../views/error");
jest.mock("../../views/report");
jest.mock("../../views/member");
jest.mock("../../utils/juz");

describe("ReportHandler", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("handleCreateReport", () => {
        let message;
        let validation;

        beforeEach(() => {
            message = {
                body: "/lapor command",
                id: { remote: "groupId123" },
            };

            validation = {};

            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: null,
            });

            memberServices.find.mockResolvedValue({
                name: "Aqwam",
                currentJuz: 1,
            });

            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            reportServices.get.mockResolvedValue([]);
        });

        it('should call and return createTerjemahReport correctly if type is "terjemah"', async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "terjemah",
                period: null,
            });

            const [finishedPages, totalPages] = [10, 20];

            await ReportHandler.handleCreateReport(message, validation);

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: finishedPages,
                totalPages: totalPages,
                juz: 1,
                type: "TERJEMAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportServices.updateMany).toHaveBeenCalledWith({
                memberName: "Aqwam",
                memberGroupId: "groupId123",
                periodStartDate: "2024-11-02T11:00:00.000Z",
                periodEndDate: "2024-11-09T10:59:59.999Z",
                totalPages: totalPages,
                type: "TERJEMAH",
            });
        });

        it('should call and return createMurottalReport correctly if type is "murottal"', async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "murottal",
                period: null,
            });

            const [finishedPages, totalPages] = [10, 20];

            await ReportHandler.handleCreateReport(message, validation);

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: finishedPages,
                totalPages: totalPages,
                juz: 1,
                type: "MUROTTAL",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportServices.updateMany).toHaveBeenCalledWith({
                memberName: "Aqwam",
                memberGroupId: "groupId123",
                periodStartDate: "2024-11-02T11:00:00.000Z",
                periodEndDate: "2024-11-09T10:59:59.999Z",
                totalPages: totalPages,
                type: "MUROTTAL",
            });
        });

        it("should call and return createTilawahReport for default case", async () => {
            const [finishedPages, totalPages] = [10, 20];

            await ReportHandler.handleCreateReport(message, validation);

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: finishedPages,
                totalPages: totalPages,
                juz: 1,
                type: "TILAWAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportServices.updateMany).toHaveBeenCalledWith({
                memberName: "Aqwam",
                memberGroupId: "groupId123",
                periodStartDate: "2024-11-02T11:00:00.000Z",
                periodEndDate: "2024-11-09T10:59:59.999Z",
                totalPages: totalPages,
                type: "TILAWAH",
            });
        });

        it("should handle previous periods correctly when previous period report does not exist", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: 1,
            });

            reportServices.find.mockResolvedValue(null);
            decrementJuz.mockReturnValue(30);

            await ReportHandler.handleCreateReport(message, validation);

            expect(decrementJuz).toHaveBeenCalledWith(1, 1);
            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: 10,
                totalPages: 20,
                juz: 30,
                type: "TILAWAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
        });

        it("should handle previous periods correctly when previous period report exists", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: 1,
            });

            reportServices.find.mockResolvedValue({
                memberGroupId: "groupId123",
                juz: 30,
            });

            await ReportHandler.handleCreateReport(message, validation);

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: 10,
                totalPages: 20,
                juz: 30,
                type: "TILAWAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
        });

        it("should handle previous periods with non-default date", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: 2,
            });

            await ReportHandler.handleCreateReport(message, validation);

            expect(getPeriodDate).toHaveBeenCalledWith(-2);
        });

        it("should handle ConflictError for tilawah report with lower pages than previous", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "5/20",
                type: "tilawah",
                period: null,
            });

            reportServices.find.mockResolvedValue({
                pages: 10,
                type: "TILAWAH",
            });

            await expect(
                ReportHandler.handleCreateReport(message, validation)
            ).rejects.toThrow(ConflictError);
        });

        it("should throw NotFoundError if member does not exist", async () => {
            memberServices.find.mockResolvedValue(null);

            await expect(
                ReportHandler.handleCreateReport(message, validation)
            ).rejects.toThrow(NotFoundError);
        });

        it("should throw ConflictError when there is no finished report on previous period", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "TILAWAH",
                period: 0,
            });

            reportServices.get.mockResolvedValue([
                {
                    juz: 5,
                    memberName: "Aqwam",
                    pages: 10,
                    totalPages: 20,
                },
            ]);

            reportViews.error.conflictReportOnPreviousPeriod.mockReturnValue(
                "Cannot create report. Previous period has unfinished report."
            );

            await expect(
                ReportHandler.handleCreateReport(message, validation)
            ).rejects.toThrow(ConflictError);

            expect(
                reportViews.error.conflictReportOnPreviousPeriod
            ).toHaveBeenCalledWith({
                juz: 5,
                memberName: "Aqwam",
                period: -1,
            });
        });

        it("should allow report creation when previous period has finished reports", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: 1,
            });

            reportServices.get.mockResolvedValue([
                {
                    juz: 5,
                    pages: 20,
                    totalPages: 20,
                    type: "TILAWAH",
                },
            ]);

            reportServices.find.mockResolvedValue(null);

            decrementJuz.mockReturnValue(30);

            await ReportHandler.handleCreateReport(message, validation);

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: 10,
                totalPages: 20,
                juz: 30,
                type: "TILAWAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
        });

        it("should throw ConflictError when finished pages exceed total pages", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "30/20",
                type: "tilawah",
                period: null,
            });

            reportViews.error.conflictTotalPages.mockReturnValue(
                "Finished pages cannot exceed total pages"
            );

            await expect(
                ReportHandler.handleCreateReport(message, validation)
            ).rejects.toThrow(ConflictError);

            expect(reportViews.error.conflictTotalPages).toHaveBeenCalled();
        });

        it("should throw ConflictError when new pages are less than previous report pages", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "5/20",
                type: "tilawah",
                period: null,
            });

            memberServices.find.mockResolvedValue({
                name: "Aqwam",
                currentJuz: 1,
            });

            reportServices.find.mockResolvedValue({
                pages: 10,
            });

            reportViews.error.conflictPages.mockReturnValue(
                "New pages cannot be less than previous report"
            );

            await expect(
                ReportHandler.handleCreateReport(message, validation)
            ).rejects.toThrow(ConflictError);

            expect(reportViews.error.conflictPages).toHaveBeenCalled();
        });

        it("should allow report creation when new pages are greater than previous report pages", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "15/20",
                type: "tilawah",
                period: null,
            });

            memberServices.find.mockResolvedValue({
                name: "Aqwam",
                currentJuz: 1,
            });

            reportServices.find.mockResolvedValue({
                pages: 10,
            });

            await ReportHandler.handleCreateReport(message, validation);

            expect(reportServices.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "Aqwam",
                    pages: 15,
                    totalPages: 20,
                })
            );
        });

        it("should allow report creation when there is no previous report", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: null,
            });

            memberServices.find.mockResolvedValue({
                name: "Aqwam",
                currentJuz: 1,
            });

            reportServices.find.mockResolvedValue(null);

            await ReportHandler.handleCreateReport(message, validation);

            expect(reportServices.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "Aqwam",
                    pages: 10,
                    totalPages: 20,
                })
            );
        });
    });

    describe("handleRemoveReport", () => {
        let message;
        let validation;

        beforeEach(() => {
            message = {
                body: "",
                id: { remote: "groupId123" },
            };
            validation = {};

            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportViews.success.remove.mockReturnValue("Success message");
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should handle report removal with multiple existing reports", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: null,
            });

            const [finishedPages, totalPages] = [10, 20];

            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: finishedPages,
                totalPages: totalPages,
                type: "TILAWAH",
            });

            reportServices.findMany.mockResolvedValue([
                { juz: 1, pages: 5 },
                { juz: 1, pages: 10 },
            ]);

            const result = await ReportHandler.handleRemoveReport(
                message,
                validation
            );

            expect(reportServices.delete).toHaveBeenCalledWith({
                memberName: "Aqwam",
                memberGroupId: "groupId123",
                periodStartDate: "2024-11-02T11:00:00.000Z",
                periodEndDate: "2024-11-09T10:59:59.999Z",
                pages: finishedPages,
                totalPages: totalPages,
                type: "TILAWAH",
            });

            expect(result).toBe("Success message");
        });

        it("should handle report removal with single existing report", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: null,
            });

            const [finishedPages, totalPages] = [10, 20];

            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: finishedPages,
                totalPages: totalPages,
                type: "TILAWAH",
            });

            reportServices.findMany.mockResolvedValue([
                { juz: 1, pages: finishedPages, totalPages },
            ]);

            const result = await ReportHandler.handleRemoveReport(
                message,
                validation
            );

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                juz: 1,
                pages: 0,
                totalPages: 0,
                type: "TILAWAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportServices.delete).toHaveBeenCalledWith({
                memberName: "Aqwam",
                memberGroupId: "groupId123",
                periodStartDate: "2024-11-02T11:00:00.000Z",
                periodEndDate: "2024-11-09T10:59:59.999Z",
                pages: finishedPages,
                totalPages: totalPages,
                type: "TILAWAH",
            });

            expect(result).toBe("Success message");
        });

        it("should handle report removal for terjemah type", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "20/20",
                type: "terjemah",
                period: null,
            });

            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 20,
                totalPages: 20,
                type: "TERJEMAH",
            });

            reportServices.findMany.mockResolvedValue([{ juz: 1, pages: 20 }]);

            const result = await ReportHandler.handleRemoveReport(
                message,
                validation
            );

            expect(reportServices.delete).toHaveBeenCalledWith({
                memberName: "Aqwam",
                memberGroupId: "groupId123",
                periodStartDate: "2024-11-02T11:00:00.000Z",
                periodEndDate: "2024-11-09T10:59:59.999Z",
                pages: 20,
                totalPages: 20,
                type: "TERJEMAH",
            });
        });

        it("should handle report removal for murottal type", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "20/20",
                type: "murottal",
                period: null,
            });

            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 20,
                totalPages: 20,
                type: "MUROTTAL",
            });

            reportServices.findMany.mockResolvedValue([{ juz: 1, pages: 20 }]);

            const result = await ReportHandler.handleRemoveReport(
                message,
                validation
            );

            expect(reportServices.delete).toHaveBeenCalledWith({
                memberName: "Aqwam",
                memberGroupId: "groupId123",
                periodStartDate: "2024-11-02T11:00:00.000Z",
                periodEndDate: "2024-11-09T10:59:59.999Z",
                pages: 20,
                totalPages: 20,
                type: "MUROTTAL",
            });
        });

        it("should handle report removal with previous periods", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: 1,
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

            reportServices.findMany.mockResolvedValue([{ juz: 1, pages: 10 }]);

            await ReportHandler.handleRemoveReport(message, validation);

            expect(getPeriodDate).toHaveBeenCalledWith(-1);
        });

        it("should throw NotFoundError if report does not exist", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pages: "10/20",
                type: "tilawah",
                period: null,
            });

            reportServices.find.mockResolvedValue(null);

            await expect(
                ReportHandler.handleRemoveReport(message, validation)
            ).rejects.toThrow(NotFoundError);
        });
    });
});
