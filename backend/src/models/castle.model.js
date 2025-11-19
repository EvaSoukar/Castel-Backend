import mongoose from "mongoose";
import EVENTS from "../constants/events.js";
import CASTLE_AMENITIES from "../constants/castleAmenities.js";
import FACILITIES from "../constants/facilities.js";
import COUNTRIES from "../constants/countries.js";

const castleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  address: { type: String, required: true },
  country: { type: String, required: true, enum: Object.values(COUNTRIES) },
  events: { type: [String], enum: Object.values(EVENTS)},
  images : [{ name: { type: String, required: true }, url: { type: String, required: true } }],
  facilities: { type: [String], enum: Object.values(FACILITIES) },
  amenities: { type: [String], enum: Object.values(CASTLE_AMENITIES) },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }],
  checkIn: { type: String, required: true, default: "15:00" },
  checkOut: { type: String, required: true, default: "11:00" },
  cancellationPolicy: { type: String, enum: ["flexible", "moderate", "strict"], default: "moderate" },
  houseRules: { type: [String] },
  safetyFeatures: { type: [String] },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  price: { type: Number }
}, { timestamps: true});

const Castle = mongoose.model("Castle", castleSchema);

export default Castle;