import express from "express";
import {
  signup,
  login,
  checkAuth,
  updateProfile,
  getProfile,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/signup", signup);
userRouter.post("/login", login);

// Protected routes
userRouter.get("/check", protectRoute, checkAuth);
userRouter.get("/profile", protectRoute, getProfile);
userRouter.put("/update-profile", protectRoute, updateProfile);

export default userRouter;
