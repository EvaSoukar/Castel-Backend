import mongoose from "mongoose";
import Room from "../models/room.model.js";
import Castle from "../models/castle.model.js";
import Booking from "../models/booking.model.js";

// Create a Room
export const createRoom = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty. Please provide all required fields." });
  }
  const { name, capacity, beds, amenities, price } = req.body;
  const { castleId } = req.params;
  // Check if all fields are filled
  const requiredFields = { name, capacity, price };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({ message: `Please provide all required fields: '${key}' field is required.` });
    }
  }

  // Check if castle id is valid
  if (!mongoose.Types.ObjectId.isValid(castleId)) {
    return res.status(400).json({ message: "The provided castle ID is not valid." });
  }

  // Create room
  const room = await Room.create({ castleId, name, capacity, beds, amenities, price });

  // Find castle
  const castle = await Castle.findById(castleId).exec();

  if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }

  // Only admin or the same owner can create room
  const isOwner = castle.owner._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "You do not have permission to create this room." });
  }

  // Add room to castle
  castle.rooms.push(room._id);
  await castle.save();

  res.status(201).json(room);
};

// Get All Rooms
export const getAllRooms = async (req, res) => {
  // Find castle
  const { castleId } = req.params;
  const castle = await Castle.findById(castleId).exec();

  if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }

  // Get all rooms
  const rooms = await Room.find({ castleId });

  res.status(200).json(rooms);
};

// Get By id
export const getRoomById = async (req, res) => {
  const { id } = req.params;

  // Check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The provided castle ID is not valid." });
  }

  // Get room
  const room = await Room.findById(id).exec();
  res.status(200).json(room);
};

// Update
export const updateRoom = async (req, res) => {
  const { castleId, id } = req.params;

  // Check if id is valid
  if (
    !mongoose.Types.ObjectId.isValid(castleId) ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return res.status(400).json({ message: "The provided castle or room ID is not valid." });
  }

  // Allowed fields to be updated
  const fieldsToUpdate = ["name", "capacity", "beds", "amenities", "price"];
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

  // Update room
  const updatedRoom = await Room.findByIdAndUpdate(id, toUpdate, { new: true }).exec();
  if (!updatedRoom) {
    return res.status(404).json({ message: "Room not found. Please check the room ID." });
  }

  // Find castle
  const castle = await Castle.findById(castleId).exec();

  if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }

  // Only admin or the same owner can update room
  const isOwner = castle.owner._id.toString() === req.user._id.toStringg();
  const isAdmin = req.user.role !== "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "You do not have permission to create this room." });
  }

  res.status(200).json(updatedRoom);
};

// Delete
export const deleteRoom = async (req, res) => {
  const { castleId, id } = req.params;

  // Check if id is valid
  if (!mongoose.Types.ObjectId.isValid(castleId)) {
    return res.status(400).json({ message: "The provided castle ID is not valid." });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The provided room ID is not valid." });
  }

  // Find castle
  const castle = await Castle.findById(castleId).exec();

  if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }

  // Only admin or the same owner can delete room
  const isAdmin = req.user.role === "admin";
  const isOwner = castle.owner._id.toString() === req.user._id.toString();
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "You do not have permission to delete this room." });
  }

  // Find and delete room
  const room = await Room.findByIdAndDelete(id).exec();

  if (!room) {
    return res.status(404).json({ message: "Room not found. Please check the room ID." });
  }

  res.status(200).json({ message: "The room has been deleted successfully." });
};

// Get Available Rooms by Date
export const getAvailableRooms = async (req, res) => {
  const { castleId } = req.params;
  const { checkInDate, checkOutDate, guests } = req.query;

  // Build room query for capacity
  const roomQuery = { castleId };
  if (guests) {
    roomQuery.capacity = { $gte: Number(guests) };
  }
  // Find all rooms in the castle with enough capacity
  let rooms = await Room.find(roomQuery);

  // If valid dates are provided, filter by availability
  if (checkInDate && checkOutDate && !isNaN(Date.parse(checkInDate)) && !isNaN(Date.parse(checkOutDate))) {
    const bookedRoomIds = await Booking.find({
      castleId,
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) }
    }).distinct("roomId");
    rooms = rooms.filter(room => !bookedRoomIds.includes(room._id.toString()));
  }

  res.status(200).json(rooms);
};
