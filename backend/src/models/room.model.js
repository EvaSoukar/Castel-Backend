// import mongoose from "mongoose";
// import AMENITIES from "../constants/amenities.js";

// const roomSchema = new mongoose.Schema({
//   castleId: { type: mongoose.Schema.Types.ObjectId, ref: "Castle", required: true },
//   name: { type: String, required: true },
//   capacity: { type: Number, required: true },
//   beds: [{ type: { type: String, required: true }, count: { type: Number, required: true }}],
//   amenities: { type: [String], enum: Object.values(AMENITIES)},
//   price: { type: Number, required: true, min: 1 },
//   availabilityStartDate: { type: Date, required: true },
//   availabilityEndDate: { type: Date, requied: true },
//   unavailableDates: { type: [Date] }
// });

// const Room = mongoose.model("Room", roomSchema);
// export default Room;