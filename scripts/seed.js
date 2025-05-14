import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../src/utils/mogodb.js";
import Invoice from "../models/Invoice.js";
import { v4 as uuidv4 } from "uuid";
if (process.env.ALLOW_SEED !== "true") {
  process.exit(1);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
  await connectDB();

  const filePath = path.join(__dirname, "../data.json");
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  await Invoice.deleteMany({ isSeed: true });
  const dataWithIds = jsonData.map((invoice) => ({
    ...invoice,
    isPublic: true,
    publicId: `${invoice.id}-${uuidv4()}`,
    isSeed: true,
  }));

  await Invoice.insertMany(dataWithIds);
  console.log("✅ Dummy data seeded successfully!");
  process.exit();
};

seed();
