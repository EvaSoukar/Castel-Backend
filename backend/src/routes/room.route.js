import express from "express";
import { createRoom, deleteRoom, getAllRooms, getAvailableRooms, getRoomById, updateRoom } from "../controllers/room.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, createRoom); // Create room
router.get("/available-rooms", getAvailableRooms);
router.get("/", getAllRooms); // Get all rooms
router.get("/:id", getRoomById); // Get one room
router.put("/:id", verifyToken, updateRoom); // Update room 
router.patch("/:id", verifyToken, updateRoom); // Update room
router.delete("/:id", verifyToken, deleteRoom); // Delete room

export default router;