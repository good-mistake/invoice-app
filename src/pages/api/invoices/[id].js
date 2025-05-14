import connectDB from "../../../utils/mogodb";
import Invoice from "../../../../models/Invoice";
import mongoose from "mongoose";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid invoice ID" });
  }

  await connectDB();

  try {
    switch (method) {
      case "PUT":
        const updatedInvoice = await Invoice.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true }
        );

        if (!updatedInvoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }

        return res.status(200).json(updatedInvoice);

      default:
        return res
          .status(405)
          .json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error in invoice update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
