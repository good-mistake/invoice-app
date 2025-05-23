import connectDB from "../../utils/mogodb";
import GuestUser from "../../../models/GuestUser";
import Invoice from "../../../models/Invoice";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import requestIp from "request-ip";

// export default async function handler(req, res) {
//   await connectDB();

//   if (req.method === "POST") {
//     try {
//       const clientIp = requestIp.getClientIp(req);
//       const { userAgent } = req.body;

//       let guest = await GuestUser.findOne({ userAgent, ip: clientIp });

//       if (!guest) {
//         guest = await GuestUser.create({
//           publicUserId: uuidv4(),
//           userAgent,
//           ip: clientIp,
//           hasCopiedInvoices: false,
//         });
//       }

//       if (!guest.hasCopiedInvoices) {
//         const publicInvoices = await Invoice.find({
//           isPublic: true,
//           isSeed: true,
//         });

//         const userInvoices = publicInvoices.map((invoice) => ({
//           ...invoice.toObject(),
//           _id: new mongoose.Types.ObjectId(),
//           user: guest._id,
//           isPublic: true,
//           isSeed: false,
//           publicId: `${invoice.id}-${uuidv4()}`,
//         }));

//         await Invoice.insertMany(userInvoices);

//         await GuestUser.findByIdAndUpdate(guest._id, {
//           $set: {
//             invoices: userInvoices.map((inv) => inv._id),
//             hasCopiedInvoices: true,
//           },
//         });
//       }

//       return res.status(200).json({ publicUserId: guest.publicUserId });
//     } catch (err) {
//       console.error("Guest API Error:", err);
//       return res.status(500).json({ error: "Server error" });
//     }
//   }

//   res.status(405).json({ message: "Method not allowed" });
// }

//the bottom is for saving and deleting the whole thing from the localstorage and get new one
export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    try {
      const clientIp = requestIp.getClientIp(req);
      const { userAgent, publicId } = req.body;

      let guest;

      if (!publicId) {
        guest = await GuestUser.create({
          publicUserId: uuidv4(),
          userAgent,
          ip: clientIp,
          hasCopiedInvoices: false,
        });
      } else {
        guest = await GuestUser.findOne({ publicUserId: publicId });

        if (!guest) {
          guest = await GuestUser.create({
            publicUserId: uuidv4(),
            userAgent,
            ip: clientIp,
            hasCopiedInvoices: false,
          });
        }
      }

      if (!guest.hasCopiedInvoices) {
        const publicInvoices = await Invoice.find({
          isPublic: true,
          isSeed: true,
        });

        const userInvoices = publicInvoices.map((invoice) => ({
          ...invoice.toObject(),
          _id: new mongoose.Types.ObjectId(),
          user: guest._id,
          isPublic: true,
          isSeed: false,
          publicId: `${invoice.id}-${uuidv4()}`,
        }));

        await Invoice.insertMany(userInvoices);

        await GuestUser.findByIdAndUpdate(guest._id, {
          $set: {
            invoices: userInvoices.map((inv) => inv._id),
            hasCopiedInvoices: true,
          },
        });
      }

      return res.status(200).json({ publicUserId: guest.publicUserId });
    } catch (err) {
      console.error("Guest API Error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
