import dotenv from "dotenv";
dotenv.config();

import client from "./config/db";
import app from "./app";
import { TMobile } from "./types/TMobiles";
import { ObjectId } from "mongodb";

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

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

        // Get mobiles
        const result = await mobilesCollection
          .find(query)
          .sort({ _id: -1 })
          .skip(skip)
          .limit(perPage)
          .toArray();

        // Total data count
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

          error,
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

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
