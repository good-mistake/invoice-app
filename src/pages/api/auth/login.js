import connectDB from "../../../utils/mogodb";
import AuthUser from "../../../../models/AuthUser";
import jwt from "jsonwebtoken";
import Cors from "cors";
const cors = Cors({
  methods: ["POST", "HEAD"],
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
  try {
    await runMiddleware(req, res, cors);
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    await connectDB();

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await AuthUser.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
