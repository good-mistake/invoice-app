import mongoose from "mongoose";

const guestUserSchema = new mongoose.Schema({
  publicUserId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  userAgent: { type: String },
  ip: { type: String },
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }],
  hasCopiedInvoices: { type: Boolean, default: false },
});

export default mongoose.models.GuestUser ||
  mongoose.model("GuestUser", guestUserSchema);
