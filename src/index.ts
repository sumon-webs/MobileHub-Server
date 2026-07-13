import dotenv from "dotenv";
dotenv.config();

import client from "./config/db";
import app from "./app";
import { TMobile } from "./types/TMobiles";
import { ObjectId } from "mongodb";

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    // await client.connect();
    // console.log("✅ MongoDB Connected");

    const db = client.db(process.env.DB_NAME);
    const mobilesCollection = db.collection<TMobile>("mobiles");

    app.get("/api/mobiles", async (req, res) => {
      try {
        const {
          search = "",
          minPrice,
          maxPrice,
          page = "1",
          limit = "8",
        } = req.query;

        const query: any = {};

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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch mobiles",
          error: error instanceof Error ? error.message : error,
        });
      }
    });

    app.get("/api/my-mobiles/:userId", async (req, res) => {
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch my mobiles",
          error: error instanceof Error ? error.message : error,
        });
      }
    });

    app.get("/api/my-mobiles/:userId/:id", async (req, res) => {
      try {
        const { userId, id } = req.params;

        const mobile = await mobilesCollection.findOne({
          _id: new ObjectId(id),
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch mobile",
          error: error instanceof Error ? error.message : error,
        });
      }
    });
    app.delete("/api/my-mobiles/:userId/:id", async (req, res) => {
      try {
        const { userId, id } = req.params;

        const result = await mobilesCollection.deleteOne({
          _id: new ObjectId(id),
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to delete mobile",
          error: error instanceof Error ? error.message : error,
        });
      }
    });
    app.get("/api/mobiles/:id", async (req, res) => {
      try {
        const { id } = req.params;

        const result = await mobilesCollection.findOne({
          _id: new ObjectId(id),
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch mobile",
          error: error instanceof Error ? error.message : error,
        });
      }
    });

    app.post("/api/mobiles", async (req, res) => {
      console.log("Hit");
      try {
        const mobile = req.body;

        // Basic validation
        if (
          !mobile.title ||
          !mobile.shortDescription ||
          !mobile.description ||
          !mobile.price ||
          !mobile.brand ||
          !mobile.releaseDate
        ) {
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to add mobile.",
          error: error instanceof Error ? error.message : error,
        });
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
