import connectDB from "../../../utils/mogodb";
import AuthUser from "../../../../models/AuthUser";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Cors from "cors";

const cors = Cors({
  methods: ["POST", "HEAD"],
  origin: "*",
});
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    );
  });
export const config = {
  api: {
    bodyParser: true,
  },
};
export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, cors);
    if (req.method !== "POST") return res.status(405).end();
    await connectDB();

    const { email } = req.body;
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    user.resetToken = resetToken;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // https://your-vercel-app.vercel.app
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.status(200).json({ message: "Password reset link sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending reset email" });
  }
}
