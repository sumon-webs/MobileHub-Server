"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("./config/db"));
const app_1 = __importDefault(require("./app"));
const mongodb_1 = require("mongodb");
const PORT = process.env.PORT || 5000;
async function main() {
    try {
        await db_1.default.connect();
        console.log("✅ MongoDB Connected");
        const db = db_1.default.db(process.env.DB_NAME);
        const mobilesCollection = db.collection("mobiles");
        app_1.default.get("/api/mobiles", async (req, res) => {
            try {
                const { search = "", minPrice, maxPrice, page = "1", limit = "8", } = req.query;
                const query = {};
                // Search by mobile title
                if (search) {
                    query.title = {
                        $regex: search,
                        $options: "i",
                    };
                }
                // Price filter
                if (minPrice || maxPrice) {
                    query.price = {};
                    if (minPrice) {
                        query.price.$gte = Number(minPrice);
                    }
                    if (maxPrice) {
                        query.price.$lte = Number(maxPrice);
                    }
                }
                const currentPage = Number(page);
                const perPage = Number(limit);
                const skip = (currentPage - 1) * perPage;
                const result = await mobilesCollection
                    .find(query)
                    .sort({ _id: -1 })
                    .skip(skip)
                    .limit(perPage)
                    .toArray();
                const total = await mobilesCollection.countDocuments(query);
                res.status(200).json({
                    success: true,
                    message: "Mobiles fetched successfully",
                    data: result,
                    pagination: {
                        total,
                        page: currentPage,
                        limit: perPage,
                        totalPages: Math.ceil(total / perPage),
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch mobiles",
                    error: error instanceof Error ? error.message : error,
                });
            }
        });
        app_1.default.get("/api/my-mobiles/:userId", async (req, res) => {
            try {
                const { userId } = req.params;
                const { page = "1", limit = "8" } = req.query;
                const currentPage = Number(page);
                const perPage = Number(limit);
                const skip = (currentPage - 1) * perPage;
                const query = { userId };
                const result = await mobilesCollection
                    .find(query)
                    .sort({ _id: -1 })
                    .skip(skip)
                    .limit(perPage)
                    .toArray();
                const total = await mobilesCollection.countDocuments(query);
                res.status(200).json({
                    success: true,
                    message: "My mobiles fetched successfully",
                    data: result,
                    pagination: {
                        total,
                        page: currentPage,
                        limit: perPage,
                        totalPages: Math.ceil(total / perPage),
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch my mobiles",
                    error: error instanceof Error ? error.message : error,
                });
            }
        });
        app_1.default.get("/api/my-mobiles/:userId/:id", async (req, res) => {
            try {
                const { userId, id } = req.params;
                const mobile = await mobilesCollection.findOne({
                    _id: new mongodb_1.ObjectId(id),
                    userId,
                });
                if (!mobile) {
                    return res.status(404).json({
                        success: false,
                        message: "Mobile not found",
                    });
                }
                res.status(200).json({
                    success: true,
                    message: "Mobile fetched successfully",
                    data: mobile,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch mobile",
                    error: error instanceof Error ? error.message : error,
                });
            }
        });
        app_1.default.delete("/api/my-mobiles/:userId/:id", async (req, res) => {
            try {
                const { userId, id } = req.params;
                const result = await mobilesCollection.deleteOne({
                    _id: new mongodb_1.ObjectId(id),
                    userId,
                });
                if (result.deletedCount === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Mobile not found or unauthorized",
                    });
                }
                res.status(200).json({
                    success: true,
                    message: "Mobile deleted successfully",
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to delete mobile",
                    error: error instanceof Error ? error.message : error,
                });
            }
        });
        app_1.default.get("/api/mobiles/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const result = await mobilesCollection.findOne({
                    _id: new mongodb_1.ObjectId(id),
                });
                if (!result) {
                    return res.status(404).json({
                        success: false,
                        message: "Mobile not found",
                        data: null,
                    });
                }
                res.status(200).json({
                    success: true,
                    message: "Mobile fetched successfully",
                    data: result,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch mobile",
                    error: error instanceof Error ? error.message : error,
                });
            }
        });
        app_1.default.post("/api/mobiles", async (req, res) => {
            console.log("Hit");
            try {
                const mobile = req.body;
                // Basic validation
                if (!mobile.title ||
                    !mobile.shortDescription ||
                    !mobile.description ||
                    !mobile.price ||
                    !mobile.brand ||
                    !mobile.releaseDate) {
                    return res.status(400).json({
                        success: false,
                        message: "All required fields are required.",
                    });
                }
                const result = await mobilesCollection.insertOne({
                    ...mobile,
                    createdAt: new Date(),
                });
                res.status(201).json({
                    success: true,
                    message: "Mobile added successfully.",
                    data: result,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to add mobile.",
                    error: error instanceof Error ? error.message : error,
                });
            }
        });
        app_1.default.listen(PORT);
    }
    catch (error) {
        console.log(error);
    }
}
main();
