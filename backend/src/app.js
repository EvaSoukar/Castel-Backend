import express from "express";
import castleRoutes from "./routes/castle.route.js";
import bookingRoutes from "./routes/booking.route.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/castles", castleRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
