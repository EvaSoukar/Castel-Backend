import mongoose from "mongoose";
import ROOM_AMENITIES from "../constants/roomAmenities.js";

const roomSchema = new mongoose.Schema({
  castleId: { type: mongoose.Schema.Types.ObjectId, ref: "Castle", required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  beds: [{ type: { type: String, required: true }, count: { type: Number, required: true }}],
  amenities: { type: [String], enum: Object.values(ROOM_AMENITIES)},
  price: { type: Number, required: true, min: 1 }
});

const Room = mongoose.model("Room", roomSchema);
export default Room;