import connectDB from "../../utils/mogodb";
import GuestUser from "../../../models/GuestUser";
import Invoice from "../../../models/Invoice";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import requestIp from "request-ip";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    try {
      await connectDB();
      const clientIp = requestIp.getClientIp(req);
      const { userAgent, storedPublicId } = req.body;

      let guest;

      // 1. If there's a storedPublicId (from localStorage), try to find the guest
      if (storedPublicId) {
        guest = await GuestUser.findOne({ publicUserId: storedPublicId });
      }

      // 2. If no guest found, create a new one
      if (!guest) {
        const publicUserId = uuidv4();
        guest = await GuestUser.create({
          publicUserId,
          userAgent,
          ip: clientIp,
          hasCopiedInvoices: false,
        });

        // Copy seed invoices
        const publicInvoices = await Invoice.find({
          isPublic: true,
          isSeed: true,
        });

        const userInvoices = publicInvoices.map((invoice) => ({
          ...invoice.toObject(),
          _id: new mongoose.Types.ObjectId(),
          user: guest._id,
          isPublic: true,
          publicId: `${invoice.id}-${uuidv4()}`,
        }));

        await Invoice.insertMany(userInvoices);

        await GuestUser.findByIdAndUpdate(guest._id, {
          $set: {
            invoices: userInvoices.map((inv) => inv._id),
            hasCopiedInvoices: true,
          },
        });

        return res.status(200).json({ publicUserId });
      }

      // If guest already exists and hasCopiedInvoices is true, just return it
      return res.status(200).json({ publicUserId: guest.publicUserId });
    } catch (err) {
      console.error("Guest API Error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
