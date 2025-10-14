import express from "express";
import { createCastle, deleteCastle, getAllCastles, getCastleById, updateCastle } from "../controllers/castle.controller.js";

const router = express.Router();

router.post("/", createCastle); // Create castle
router.get("/", getAllCastles); // Get all castles
router.get("/:id", getCastleById); // Get one castle
router.put("/:id", updateCastle); // Update castle
router.patch("/:id", updateCastle); // Update castle
router.delete("/:id", deleteCastle); // Delete castle

export default router;