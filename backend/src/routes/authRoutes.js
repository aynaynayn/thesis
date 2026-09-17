import { Router } from "express";
import {
  getMe,
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  createPetProfile,
  updatePetProfile,
  deletePetProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.post("/pet-profiles", protect, createPetProfile);
router.patch("/pet-profiles/:id", protect, updatePetProfile);
router.delete("/pet-profiles/:id", protect, deletePetProfile);

export default router;
