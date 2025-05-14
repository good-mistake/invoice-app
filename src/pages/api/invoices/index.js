import Cors from "cors";
import Invoice from "../../../../models/Invoice";
import GuestUser from "../../../../models/GuestUser";
import AuthUser from "../../../../models/AuthUser";
import connectDB from "../../../utils/mogodb";
import jwt from "jsonwebtoken";
const cors = Cors({
  methods: ["GET", "POST", "DELETE", "PUT"],
  origin: "*",
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

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

  if (req.method === "GET") {
    try {
      if (!userId) {
        const publicUserId = req.headers["x-public-user-id"];
        const guest = await GuestUser.findOne({ publicUserId });
        if (!guest) return res.status(404).json({ message: "Guest not found" });

        const guestInvoices = await Invoice.find({ user: guest._id });
        return res.status(200).json(guestInvoices);
      }
      const user = await AuthUser.findById(userId);

      const userInvoices = await Invoice.find({ _id: { $in: user.invoices } });
      return res.status(200).json(userInvoices);
    } catch (err) {
      console.error("GET Error:", err);
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }

  if (req.method === "POST") {
    try {
      const invoiceData = req.body;
      if (!userId) {
        const publicUserId = req.headers["x-public-user-id"];
        const guest = await GuestUser.findOne({ publicUserId });
        if (!guest) return res.status(404).json({ message: "Guest not found" });

        invoiceData.isPublic = true;
        invoiceData.user = guest._id;
        delete invoiceData.userId;
      } else {
        invoiceData.isPublic = false;
        invoiceData.user = userId;
        delete invoiceData.user;
      }

      const newInvoice = await Invoice.create(invoiceData);
      if (userId) {
        await AuthUser.findByIdAndUpdate(userId, {
          $push: { invoices: newInvoice._id },
        });
      }
      return res.status(201).json(newInvoice);
    } catch (err) {
      console.error("POST Error:", err);
      return res.status(500).json({ error: "Failed to create invoice" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.body;

      if (!userId) {
        const publicUserId = req.headers["x-public-user-id"];
        const guest = await GuestUser.findOne({ publicUserId });
        if (!guest) return res.status(404).json({ message: "Guest not found" });

        const deletedInvoice = await Invoice.findOneAndDelete({
          id,
          user: guest._id,
        });

        if (!deletedInvoice)
          return res
            .status(404)
            .json({ message: "Invoice not found for this guest" });
        return res
          .status(200)
          .json({ message: "Invoice Deleted Successfully", deletedInvoice });
      }

      const deletedInvoice = await Invoice.findOneAndDelete({
        id,
      });

      if (!deletedInvoice)
        return res
          .status(404)
          .json({ message: "Invoice not found for this user" });
      return res
        .status(200)
        .json({ message: "Invoice Deleted Successfully", deletedInvoice });
    } catch (err) {
      console.error("DELETE Error:", err);
      return res.status(500).json({ error: "Failed to delete invoice" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, status, ...updateData } = req.body;

      if (!userId) {
        const publicUserId = req.headers["x-public-user-id"];
        const guest = await GuestUser.findOne({ publicUserId });
        if (!guest) return res.status(404).json({ message: "Guest not found" });

        const updatedInvoice = await Invoice.findOneAndUpdate(
          { id, user: guest._id },
          { status, ...updateData },
          { new: true }
        );

        if (!updatedInvoice)
          return res
            .status(404)
            .json({ message: "Invoice not found for this guest" });
        return res.status(200).json(updatedInvoice);
      }
      const updatedInvoiceForAuthUser = await Invoice.findOneAndUpdate(
        { id },
        { status, ...updateData },
        { new: true }
      );
      if (!updatedInvoiceForAuthUser)
        return res
          .status(404)
          .json({ message: "Invoice not found for this user" });

      return res.status(200).json(updatedInvoiceForAuthUser);
    } catch (err) {
      console.error("PUT Error:", err);
      return res.status(500).json({ error: "Failed to update invoice" });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
