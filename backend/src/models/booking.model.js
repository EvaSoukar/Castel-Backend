import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  castleId: { type: mongoose.Schema.Types.ObjectId, ref: "Castle", required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 1 },
  status: ["pending", "confirmed", "cancelled"],
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;