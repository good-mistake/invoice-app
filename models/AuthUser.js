import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const authUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, required: false, default: "" },
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }],
});
authUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
authUserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.models.AuthUser ||
  mongoose.model("AuthUser", authUserSchema);
