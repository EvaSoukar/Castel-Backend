import express from "express";
import { createCastle, deleteCastle, getAllCastles, getCastleBookings, getCastleById, updateCastle } from "../controllers/castle.controller.js";
import { verifyRoles, verifyToken } from "../middleware/auth.middleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.post("/", verifyToken, verifyRoles(ROLES.ADMIN, ROLES.OWNER), createCastle); // Create castle
router.get("/", getAllCastles); // Get all castles
router.get("/:id", getCastleById); // Get one castle
router.put("/:id", verifyToken, updateCastle); // Update castle
router.patch("/:id", verifyToken, updateCastle); // Update castle
router.delete("/:id", verifyToken, deleteCastle); // Delete castle
router.get("/:id/bookings", verifyToken, getCastleBookings); // Get all bookings for a castle(owner)

export default router;