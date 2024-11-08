const { validate } = require("../validator");
const ValidationError = require("../../exceptions/ValidationError");

describe("Utils - validate with various command examples", () => {
    it("should validate /register-group command", () => {
        const command = "/register-group 3";
        const validation = {
            regex: /^\/register-group\s+\d+\s*$/,
            multiple: false,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid command format",
        });
        expect(result).toBeUndefined();
    });

    it("should validate /register command with multiple entries", () => {
        const command = "/register 12#Aqwam 13#Ivo";
        const validation = {
            regex: /(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*(?=\d|$)/g,
            multiple: true,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid format for /register",
        });
        expect(result).toEqual([
            { juz: "12", name: "Aqwam" },
            { juz: "13", name: "Ivo" },
        ]);
    });

    it("should validate /set command", () => {
        const command = "/set 15#Aqwam";
        const validation = {
            regex: /^\/set\s+(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*$/,
            multiple: false,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid format for /set",
        });
        expect(result).toEqual({ juz: "15", name: "Aqwam" });
    });

    it("should validate /remove command", () => {
        const command = "/remove Aqwam";
        const validation = {
            regex: /^\/remove\s+(?<name>[a-zA-Z\s]+?)\s*$/,
            multiple: false,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid format for /remove",
        });
        expect(result).toEqual({ name: "Aqwam" });
    });

    it("should validate /register-admin command", () => {
        const command = "/register-admin Aqwam#1234567890 pass123";
        const validation = {
            regex: /^\/register-admin\s+(?<name>[a-zA-Z\s]+)#(?<phone>\d+)\s+(?<password>\S+)$/,
            multiple: false,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid format for /register-admin",
        });
        expect(result).toEqual({
            name: "Aqwam",
            phone: "1234567890",
            password: "pass123",
        });
    });

    it("should validate /remove-admin command", () => {
        const command = "/remove-admin 1234567890";
        const validation = {
            regex: /^\/remove-admin\s+(?<phone>\d+)$/,
            multiple: false,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid format for /remove-admin",
        });
        expect(result).toEqual({ phone: "1234567890" });
    });

    it("should validate /lapor command", () => {
        const command = "/lapor Aqwam#10/20 -1";
        const validation = {
            regex: /^\/lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+\/\d+|terjemah|murottal)(?:\s*-\s*(?<previousPeriods>\d+))?\s*$/,
            multiple: false,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid format for /lapor",
        });
        expect(result).toEqual({
            name: "Aqwam",
            pagesOrType: "10/20",
            previousPeriods: "1",
        });
    });

    it("should validate /batal-lapor command", () => {
        const command = "/batal-lapor Aqwam#terjemah";
        const validation = {
            regex: /^\/batal-lapor\s+(?<name>[a-zA-Z\s]+?)#(?<pagesOrType>\d+\/\d+|terjemah|murottal)(?:\s*-\s*(?<previousPeriods>\d+))?\s*$/,
            multiple: false,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid format for /batal-lapor",
        });
        expect(result).toEqual({
            name: "Aqwam",
            pagesOrType: "terjemah",
            previousPeriods: undefined,
        });
    });

    it("should validate /list command", () => {
        const command = "/list";
        const validation = {
            regex: /^\/list\s*$/,
            multiple: false,
        };

        const result = validate({
            command,
            validation,
            errorMessage: "Invalid format for /list",
        });
        expect(result).toBeUndefined();
    });

    it("should throw ValidationError for invalid multiple entries command format", () => {
        const command = "/register invalid";
        const validation = {
            regex: /(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*(?=\d|$)/g,
            multiple: true,
        };

        expect(() =>
            validate({
                command,
                validation,
                errorMessage: "Invalid format for /register",
            })
        ).toThrow(new ValidationError("Invalid format for /register"));
    });

    it("should throw ValidationError for invalid command format", () => {
        const command = "/set-invalid 15#Aqwam";
        const validation = {
            regex: /^\/set\s+(?<juz>\d{1,3})#(?<name>[a-zA-Z\s]+?)\s*$/,
            multiple: false,
        };

        expect(() =>
            validate({
                command,
                validation,
                errorMessage: "Invalid format for /set",
            })
        ).toThrow(new ValidationError("Invalid format for /set"));
    });
});
