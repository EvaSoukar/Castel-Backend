import mongoose from "mongoose";
import Castle from "../models/castle.model.js";
import Booking from "../models/booking.model.js";

// Create a Castle
export const createCastle = async (req, res, next) => {
if (!req.body || Object.keys(req.body).length === 0) {
  return res.status(400).json({ message: "Request body is empty. Please provide all required fields." });
}
  const { name, description, address, events, images, facilities, amenities, rooms, checkIn, checkOut, cancellationPolicy, houseRules, safetyFeatures } = req.body;
  const owner = req.user._id;

  // Check if all fields are filled
  const requiredFields = { name, description, owner, address, images, checkIn, checkOut };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({ message: `Please provide all required fields: ${key} field is required.` });
    }
  };

  // Create castle
  const castle = await Castle.create({ name, description, owner, address, events, images, facilities, amenities, rooms, checkIn, checkOut, cancellationPolicy, houseRules, safetyFeatures });
  
  // Return response
  res.status(201).json(castle);
};

// Get all Castles
export const getAllCastles = async (req, res) => {
  // Get all castles and populate owner(without password) and rooms
  const castles = await Castle.find().select("-bookings").populate("owner", "-password").populate("rooms").exec();
  res.status(200).json(castles);
};

// Get Castle by id
export const getCastleById = async (req, res) => {
  const { id } = req.params;
  
  // Check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The provided castle ID is not valid." });
  }

  // Find castle and populate owner and rooms
  const castle = await Castle.findById(id).populate("owner", "-password").populate("rooms", "-_id").exec();
  res.status(200).json(castle);
};

//Update
export const updateCastle = async (req,res) => {
  const { id } = req.params;

  // Allowed fields to be updated
  const fieldsToUpdate = ["name", "description", "address", "events", "images", "facilities", "amenities", "rooms", "checkIn", "checkOut", "cancellationPolicy", "houseRules", "safetyFeatures"];
  const toUpdate = {};

  // Populate the changes
  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      toUpdate[field] = req.body[field];
    }
  });
  
  // Error if no changes are made
  if (Object.keys(toUpdate).length === 0) {
    return res.status(400).json({ message: "You didn't update any fields. Please modify at least one field to proceed." });
  }

  // Update castle
  const updatedCastle = await Castle.findByIdAndUpdate(id, toUpdate, { new: true }).exec();

  if (!updatedCastle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }
  // Only admin or the same owner can update
  if (updatedCastle.owner.toString() !== req.user._id && req.user.role !== "admin") {
    return res.status(403).json({ message: "You do not have permission to update this castle" });
  }
  
  res.status(200).json(updatedCastle);
};

// Delete
export const deleteCastle = async (req, res) => {
  const { id } = req.params;

  // Check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The provided castle ID is not valid." });
  }

  // Find castle
  const castle = await Castle.findById(id).exec();

  if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }

  // Only admin or the same owner can delete
  if (castle.owner.toString() !== req.user._id && req.user.role !== "admin") {
    return res.status(403).json({ message: "You do not have permission to delete this castle." });
  }
  await Castle.findByIdAndDelete(id).exec();
  res.status(200).json({ message: "The castle has been deleted successfully." });
};

// Get bookings by castle ID(owner only)
export const getCastleBookings = async (req, res) => {
  // Find castle
  const { id } = req.params;
  const castle = await Castle.findById(id);
   if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }
  // Get bookings
  const bookings = await Booking.find({ id });

  // Only owner of the castle can get castle bookings
  if (castle.owner._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You are not allowed to see this information." });
  }

  res.status(200).json(bookings);
};