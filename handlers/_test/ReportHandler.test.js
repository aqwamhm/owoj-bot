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

            jest.spyOn(ReportHandler, "createTilawahReport").mockResolvedValue(
                "testTilawah"
            );
            jest.spyOn(ReportHandler, "createTerjemahReport").mockResolvedValue(
                "testTerjemah"
            );
            jest.spyOn(ReportHandler, "createMurottalReport").mockResolvedValue(
                "testMurottal"
            );
        });

        it('should call and return createTerjemahReport correctly if pagesOrType is "terjemah"', async () => {
            const result = await ReportHandler.handleCreateReport(
                message,
                validation
            );

            expect(ReportHandler.createTerjemahReport).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                juz: 1,
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(ReportHandler.createMurottalReport).not.toHaveBeenCalled();
            expect(ReportHandler.createTilawahReport).not.toHaveBeenCalled();

            expect(result).toEqual("testTerjemah");
        });

        it('should call and return createMurottalReport correctly if pagesOrType is "murottal"', async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "murottal",
                previousPeriods: null,
            });

            const result = await ReportHandler.handleCreateReport(
                message,
                validation
            );

            expect(ReportHandler.createMurottalReport).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                juz: 1,
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(ReportHandler.createTerjemahReport).not.toHaveBeenCalled();
            expect(ReportHandler.createTilawahReport).not.toHaveBeenCalled();

            expect(result).toEqual("testMurottal");
        });

        it('should call and return createTilawahReport correctly if pagesOrType is not "terjemah" or "murottal"', async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: null,
            });

            const result = await ReportHandler.handleCreateReport(
                message,
                validation
            );

            expect(ReportHandler.createTilawahReport).toHaveBeenCalledWith({
                groupId: "groupId123",
                juz: 1,
                name: "Aqwam",
                pages: "10/20",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(ReportHandler.createTerjemahReport).not.toHaveBeenCalled();
            expect(ReportHandler.createMurottalReport).not.toHaveBeenCalled();

            expect(result).toEqual("testTilawah");
        });

        it("should handle previous periods correctly when previous period report is not exist", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: 1,
            });

            reportServices.find.mockResolvedValue(null);
            decrementJuz.mockReturnValue(30);

            await ReportHandler.handleCreateReport(message, validation);

            expect(decrementJuz).toHaveBeenCalledWith(1, 1);
            expect(ReportHandler.createTilawahReport).toHaveBeenCalledWith({
                groupId: "groupId123",
                juz: 30,
                name: "Aqwam",
                pages: "10/20",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
        });

        it("should handle previous periods correctly when previous period report is exist", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: 1,
            });

            reportServices.find.mockResolvedValue({
                memberGroupId: "groupId123",
                juz: 30,
            });

            await ReportHandler.handleCreateReport(message, validation);

            expect(ReportHandler.createTilawahReport).toHaveBeenCalledWith({
                groupId: "groupId123",
                juz: 30,
                name: "Aqwam",
                pages: "10/20",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
        });

        it("should throw NotFoundError if member does not exist", async () => {
            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: 1,
            });

            memberServices.find.mockResolvedValue(null);

            await expect(
                ReportHandler.handleCreateReport(message, validation)
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("createTerjemahReport", () => {
        it("should create a terjemah report successfully", async () => {
            reportViews.success.create.mockReturnValue("Success message");

            const result = await ReportHandler.createTerjemahReport({
                name: "Aqwam",
                groupId: "groupId123",
                juz: 1,
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: 20,
                juz: 1,
                type: "TERJEMAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportViews.success.create).toHaveBeenCalledWith({
                name: "Aqwam",
                pages: 20,
                juz: 1,
                type: "TERJEMAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(result).toEqual("Success message");
        });
    });

    describe("createMurottalReport", () => {
        it("should create a murottal report successfully", async () => {
            reportViews.success.create.mockReturnValue("Success message");

            const result = await ReportHandler.createMurottalReport({
                name: "Aqwam",
                groupId: "groupId123",
                juz: 1,
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: 20,
                juz: 1,
                type: "MUROTTAL",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportViews.success.create).toHaveBeenCalledWith({
                name: "Aqwam",
                pages: 20,
                juz: 1,
                type: "MUROTTAL",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(result).toEqual("Success message");
        });
    });

    describe("createTilawahReport", () => {
        it("should create a tilawah report successfully", async () => {
            reportViews.success.create.mockReturnValue("Success message");

            const result = await ReportHandler.createTilawahReport({
                name: "Aqwam",
                groupId: "groupId123",
                pages: "10/20",
                juz: 1,
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(reportServices.create).toHaveBeenCalledWith({
                name: "Aqwam",
                groupId: "groupId123",
                pages: 10,
                totalPages: 20,
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
                totalPages: 20,
            });

            expect(reportViews.success.create).toHaveBeenCalledWith({
                name: "Aqwam",
                pages: "10/20",
                juz: 1,
                type: "TILAWAH",
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });

            expect(result).toEqual("Success message");
        });

        it("should throw ConflictError if report pages is less than or equal to previous report pages", async () => {
            reportServices.find.mockResolvedValue({
                memberGroupId: "groupId123",
                juz: 1,
                pages: 10,
            });

            await expect(
                ReportHandler.createTilawahReport({
                    name: "Aqwam",
                    groupId: "groupId123",
                    juz: 1,
                    pages: "10/20",
                    startDate: "2024-11-02T11:00:00.000Z",
                    endDate: "2024-11-09T10:59:59.999Z",
                })
            ).rejects.toThrow(ConflictError);
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

            jest.spyOn(reportServices, "create");
            jest.spyOn(reportServices, "delete");

            getPeriodDate.mockReturnValue({
                startDate: "2024-11-02T11:00:00.000Z",
                endDate: "2024-11-09T10:59:59.999Z",
            });
            reportViews.success.remove.mockReturnValue("Success message");
        });

        it("should remove a terjemah report and create default empty report if only one previous report", async () => {
            message.body = "/batal-lapor Aqwam#terjemah";

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "terjemah",
                previousPeriods: null,
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 20,
                totalPages: 20,
                type: "TERJEMAH",
            });
            reportServices.findMany.mockResolvedValue([
                {
                    memberName: "Aqwam",
                    juz: 1,
                    pages: 20,
                    totalPages: 20,
                    type: "TERJEMAH",
                },
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
                pages: 20,
                totalPages: 20,
                type: "TERJEMAH",
            });
            expect(result).toEqual("Success message");
        });

        it("should remove a murottal report and create default empty report if only one previous report", async () => {
            message.body = "/batal-lapor Aqwam#murottal";

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "murottal",
                previousPeriods: null,
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 20,
                totalPages: 20,
                type: "MUROTTAL",
            });
            reportServices.findMany.mockResolvedValue([
                {
                    name: "Aqwam",
                    pages: 20,
                    totalPages: 20,
                    juz: 1,
                    type: "MUROTTAL",
                },
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
                pages: 20,
                totalPages: 20,
                type: "MUROTTAL",
            });
            expect(result).toEqual("Success message");
        });

        it("should remove a tilawah report and create default empty report if only one previous report", async () => {
            message.body = "/batal-lapor Aqwam#10/20";

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: null,
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 10,
                totalPages: 20,
                type: "TILAWAH",
            });
            reportServices.findMany.mockResolvedValue([
                {
                    name: "Aqwam",
                    pages: 10,
                    totalPages: 20,
                    juz: 1,
                    type: "TILAWAH",
                },
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
                pages: 10,
                totalPages: 20,
                type: "TILAWAH",
            });
            expect(result).toEqual("Success message");
        });

        it("should remove tilawah report directly there were more than one previous report", async () => {
            message.body = "/batal-lapor Aqwam#10/20";

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: null,
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 10,
                totalPages: 20,
                type: "TILAWAH",
            });
            reportServices.findMany.mockResolvedValue([
                {
                    name: "Aqwam",
                    pages: 5,
                    totalPages: 20,
                    juz: 1,
                    type: "TILAWAH",
                },
                {
                    name: "Aqwam",
                    pages: 10,
                    totalPages: 20,
                    juz: 1,
                    type: "TILAWAH",
                },
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
                pages: 10,
                totalPages: 20,
                type: "TILAWAH",
            });
            expect(result).toEqual("Success message");
        });

        it("should remove terjemah report directly there were more than one previous report", async () => {
            message.body = "/batal-lapor Aqwam#terjemah";
            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "terjemah",
                previousPeriods: null,
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 20,
                totalPages: 20,
                type: "TERJEMAH",
            });
            reportServices.findMany.mockResolvedValue([
                {
                    name: "Aqwam",
                    pages: 20,
                    totalPages: 20,
                    juz: 1,
                    type: "TERJEMAH",
                },
                {
                    name: "Aqwam",
                    pages: 20,
                    totalPages: 20,
                    juz: 1,
                    type: "TERJEMAH",
                },
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
                pages: 20,
                totalPages: 20,
                type: "TERJEMAH",
            });
            expect(result).toEqual("Success message");
        });

        it("should remove murottal report directly there were more than one previous report", async () => {
            message.body = "/batal-lapor Aqwam#murottal";
            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "murottal",
                previousPeriods: null,
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 20,
                totalPages: 20,
                type: "MUROTTAL",
            });
            reportServices.findMany.mockResolvedValue([
                {
                    name: "Aqwam",
                    pages: 20,
                    totalPages: 20,
                    juz: 1,
                    type: "MUROTTAL",
                },
                {
                    name: "Aqwam",
                    pages: 20,
                    totalPages: 20,
                    juz: 1,
                    type: "MUROTTAL",
                },
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
                pages: 20,
                totalPages: 20,
                type: "MUROTTAL",
            });
            expect(result).toEqual("Success message");
        });

        it("should call getPeriodDate correctly if previousPeriods is not null", async () => {
            message.body = "/batal-lapor Aqwam#10/20 -1";

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "10/20",
                previousPeriods: 1,
            });
            reportServices.find.mockResolvedValue({
                name: "Aqwam",
                pages: 10,
                totalPages: 20,
                type: "TILAWAH",
            });
            reportServices.findMany.mockResolvedValue([
                {
                    name: "Aqwam",
                    pages: 10,
                    totalPages: 20,
                    juz: 1,
                    type: "TILAWAH",
                },
            ]);

            await ReportHandler.handleRemoveReport(message, validation);

            expect(getPeriodDate).toHaveBeenCalledWith(-1);
        });

        it("should throw NotFoundError if report does not exist", async () => {
            message.body = "/batal-lapor Aqwam#terjemah";

            validate.mockReturnValue({
                name: "Aqwam",
                pagesOrType: "terjemah",
                previousPeriods: null,
            });

            reportServices.find.mockResolvedValue(null);

            await expect(
                ReportHandler.handleRemoveReport(message, validation)
            ).rejects.toThrow(NotFoundError);
        });
    });
});
