import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

if (!process.env.SUPERADMIN_EMAIL || !process.env.SUPERADMIN_PASSWORD) {
  console.error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env. No account was created.");
  process.exit(1);
}
if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
await mongoose.connect(process.env.MONGO_URI);
const existing = await User.findOne({ role: "superadmin" });
if (existing) console.log("A superadmin already exists. No changes made.");
else {
  const email = process.env.SUPERADMIN_EMAIL.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user) { user.role = "superadmin"; user.isOwner = true; user.isActive = true; user.password = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 12); await user.save(); }
  else await User.create({ name: "PawFit Owner", email, password: await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 12), role: "superadmin", isOwner: true, isActive: true });
  console.log("Superadmin account is ready.");
}
await mongoose.disconnect();
