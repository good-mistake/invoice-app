import connectDB from "../../../utils/mogodb";
import AuthUser from "../../../../models/AuthUser";
import jwt from "jsonwebtoken";
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

    const { email, password } = req.body;
    const userExists = await AuthUser.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "User Already Exist!" });
    const newUser = new AuthUser({ email, password });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token, user: { email: newUser.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
}
