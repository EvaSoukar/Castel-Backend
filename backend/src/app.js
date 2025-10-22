import express from "express";
import castleRoutes from "./routes/castle.route.js";
import roomRoutes from "./routes/room.route.js";
import bookingRoutes from "./routes/booking.route.js";
import userRoutes from "./routes/user.route.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();

// Middleware to parse URL-encoded data (Form data)
app.use(express.urlencoded({ extended: false }));

// Middleware to parse JSON requests
app.use(express.json());

// Route handlers
app.use("/api/castles", castleRoutes);
app.use("/api/castles/:castleId/rooms", roomRoutes);
app.use("/api", bookingRoutes);
app.use("/api/auth", userRoutes);

// Middleware for error handling
app.use(notFound);
app.use(errorHandler);

export default app;
