import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "PawFit API is running! 🐾" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to MongoDB Atlas");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("mongoDB connection error:", err);
  });
