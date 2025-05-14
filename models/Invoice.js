import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: false },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const addressSchema = new mongoose.Schema({
  street: { type: String, required: false, default: "N/A" },
  city: { type: String, required: false, default: "Unknown" },
  postCode: { type: String, required: false, default: "00000" },
  country: { type: String, required: false, default: "Unknown" },
});

const invoiceSchema = new mongoose.Schema({
  id: { type: String, required: false },
  createdAt: { type: Date, required: false },
  paymentDue: { type: Date, required: false },
  description: { type: String, required: false },
  paymentTerms: { type: Number, required: false },
  clientName: { type: String, required: false },
  clientEmail: { type: String, required: false },
  status: { type: String, required: false },
  senderAddress: addressSchema,
  clientAddress: addressSchema,
  items: [itemSchema],
  total: { type: Number, required: false },
  isPublic: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, refPath: "userType" },
  publicId: { type: String, required: false },
});

invoiceSchema.virtual("userType").get(function () {
  return this.isPublic ? "GuestUser" : "AuthUser";
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);
