const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const connectDB = async () => {
    try {
        if (process.env.NODE_ENV !== "test") {
            await prisma.$connect();
            console.log("Database connection established successfully.");
        }
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    }
};

connectDB();

module.exports = { prisma, connectDB };
