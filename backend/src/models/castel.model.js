import mongoose from "mongoose";
import EVENTS from "../constants/events.js";
import AMENITIES from "../constants/amenities.js";
import FACILITIES from "../constants/facilities.js";

const roomSchema = new mongoose.Schema({
  castleId: { type: mongoose.Schema.Types.ObjectId, ref: "Castle", required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  beds: [{ type: { type: String, required: true }, count: { type: Number, required: true }}],
  amenities: { type: [String], enum: Object.values(AMENITIES)},
  price: { type: Number, required: true, min: 1 },
  availabilityStartDate: { type: Date, required: true },
  availabilityEndDate: { type: Date, requied: true },
  unavailableDates: { type: [Date] }
});

const castelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  address: { type: String, required: true },
  events: { type: [String], enum: Object.values(EVENTS)},
  images : { type: [String], required: true },
  facilities: { type: [String], enum: Object.values(FACILITIES)},
  amenities: { type: [String], enum: Object.values(AMENITIES)},
  rooms: { type: [roomSchema], required: true },
  checkIn: { type: String, required: true, default: "15:00" },
  checkOut: { type: String, required: true, default: "11:00" },
  cancellationPolicy: { type: String, enum: ["flexible", "moderate", "strict"], default: "moderate" },
  houseRules: { type: [String] },
  safetyFeatures: { type: [String] }
}, { timestamps: true});

const Castel = mongoose.model("Castel", castelSchema);
const Room = mongoose.model("Room", roomSchema);

export default Castel;