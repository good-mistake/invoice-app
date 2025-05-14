import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../src/utils/mogodb.js";
import Invoice from "../models/Invoice.js";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
  await connectDB();

  const filePath = path.join(__dirname, "../data.json");
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const dataWithIds = jsonData.map((invoice) => ({
    ...invoice,
    id: invoice.id,
    isPublic: true,
    publicId: `${invoice.id}-${uuidv4()}`,
  }));

  await Invoice.insertMany(dataWithIds);
  console.log("✅ Dummy data seeded successfully!");
  process.exit();
};

seed();
