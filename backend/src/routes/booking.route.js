import express from "express";
import { createBooking, deleteBooking, getAllBookings, getBookingById, getBookingsByUserId, updateBooking } from "../controllers/booking.controller.js";
import { verifyRoles, verifyToken } from "../middleware/auth.middleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router({ mergeParams: true });

router.post("/castles/:castleId/rooms/:roomId/bookings", verifyToken, createBooking); // Create a booking
router.get("/bookings", verifyToken, verifyRoles(ROLES.ADMIN), getAllBookings); // Get all bookings(Admin)
router.get("/bookings/user/:userId", verifyToken, getBookingsByUserId);
router.get("/bookings/:bookingId", verifyToken, getBookingById); // Get one booking
router.put("/bookings/:bookingId", verifyToken, updateBooking); // Update booking
router.patch("/bookings/:bookingId", verifyToken, updateBooking); // Update booking
router.delete("/bookings/:bookingId", verifyToken, deleteBooking); // Delete booking

export default router;