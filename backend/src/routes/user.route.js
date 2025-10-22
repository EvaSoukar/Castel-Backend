import express from "express";
import { deleteUser, getAllUsers, getUserProfile, login, register, updateRole, updateUser } from "../controllers/user.controller.js";
import { verifyRoles, verifyToken } from "../middleware/auth.middleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.post("/register", register); // Create User
router.post("/login", login); // Login
router.post("/role/:id", verifyToken, verifyRoles(ROLES.ADMIN), updateRole); // Change user's role
router.get("/users", verifyToken, verifyRoles(ROLES.ADMIN), getAllUsers); // Get all users
router.patch("/:userId", verifyToken, updateUser); // Update User information
router.get("/profile", verifyToken, getUserProfile); // Get User profile
router.delete("/:userId", verifyToken, deleteUser); // delete user

export default router;