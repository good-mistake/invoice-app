import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { file } = req.body;
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        console.error(e);
      }
    }
    if (!userId) {
      return res.status(401).json({ error: "Login required to upload" });
    }
    try {
      const uploadRes = await cloudinary.uploader.upload(file, {
        folder: "user-images",
      });

      res.status(200).json({ url: uploadRes.secure_url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to upload" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
