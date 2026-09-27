import express from "express";
import {
  signup,
  login,
  checkAuth,
  updateProfile,
  getProfile,
  getUserStats,
  changePassword,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/signup", signup);
userRouter.post("/login", login);

// Protected routes
userRouter.get("/check", protectRoute, checkAuth);
userRouter.get("/profile", protectRoute, getProfile);
userRouter.get("/stats", protectRoute, getUserStats);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.put("/change-password", protectRoute, changePassword);

export default userRouter;
