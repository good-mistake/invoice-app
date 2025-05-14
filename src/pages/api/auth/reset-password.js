import connectDB from "../../../utils/mogodb";
import AuthUser from "../../../../models/AuthUser";
import jwt from "jsonwebtoken";
import Cors from "cors";
const cors = Cors({
  methods: ["POST", "HEAD", "PUT"],
  origin: "*",
});

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (err) => (err ? reject(err) : resolve()));
  });
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, cors);
    await connectDB();
    const { password, token } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Missing token or password" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }
    const user = await AuthUser.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    user.password = password;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error reset password" });
  }
}
