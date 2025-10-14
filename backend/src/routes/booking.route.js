import express from "express";

const router = express.Router();

router.post("/", () => {}); // Create a booking
router.get("/", () => {}); // Get all bookings
router.get("/:id", () => {}); // Get one booking

export default router;