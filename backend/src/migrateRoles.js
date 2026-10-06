import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
await mongoose.connect(process.env.MONGO_URI);
const result = await User.updateMany({ role: "seller" }, { $set: { role: "admin" } });
console.log(`Migrated ${result.modifiedCount} seller account(s) to admin.`);
await mongoose.disconnect();
