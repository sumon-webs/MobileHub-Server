import dotenv from "dotenv";
dotenv.config();

import client from "./config/db";
import app from "./app";
import { TMobile } from "./types/TMobiles";

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db(process.env.DB_NAME);
    const mobilesCollection = db.collection<TMobile>("mobiles");

    app.get("/api/mobiles", async (_req, res) => {
      const result = await mobilesCollection.find().toArray();

      res.status(200).json({
        success: true,
        message: "Mobiles fetched successfully",
        data: result,
      });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
