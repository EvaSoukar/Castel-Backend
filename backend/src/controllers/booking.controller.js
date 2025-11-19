import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Room from "../models/room.model.js";
import Castle from "../models/castle.model.js";

// Create Booking
export const createBooking = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty. Please provide all required fields." });
  }
  const { checkInDate, checkOutDate, guests } = req.body;
  const userId = req.user._id;
  const { castleId, roomId } = req.params;
  // Check if all fields are filled
  const requiredFields = { checkInDate, checkOutDate, guests };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({ message: `Please provide all required fields: '${key}' field is required.` });
    }
  }

  // Check if id is valid
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(castleId) ||
    !mongoose.Types.ObjectId.isValid(roomId)
  ) {
      return res.status(400).json({ message: "One or more of the provided IDs are not valid" });
  }

  // Find castle and room
  const castle = await Castle.findById(castleId).exec();
  const room = await Room.findById(roomId).exec();

  if (!castle || !room) {
    return res.status(404).json({ message: "Castle or room not found. Please check the castle or room ID." });
  }

  if (room.castleId.toString() !== castleId) {
    return res.status(400).json({ message: "The room does not belong to the selected castle." });
  }

  // Calculate number of nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  if (isNaN(nights) || nights <= 0) {
    return res.status(400).json({ message: "Invalid check-in or check-out date." });
  }

  // Check if room is already booked
  const isBooked = await Booking.findOne({
    roomId,
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn } 
  });

  if (isBooked) {
    return res.status(400).json({ message: "Room is already booked for the selected dates. Please choose other dates." });
  }

  // Calculate total price
  const totalPrice = room.price * nights;

  // Create boking
  const booking = await Booking.create({ userId, castleId, roomId, checkInDate, checkOutDate, guests, totalPrice });
  
  castle.bookings.push(booking._id);
  await castle.save();
  res.status(201).json(booking);
};

// Get All bookings(Admin only)
export const getAllBookings = async (req, res) => {
  // Find bookings
  const bookings = await Booking.find().exec();

  res.status(200).json(bookings);
};

// Get Booking by id
export const getBookingById = async (req, res) => {
  // Find booking
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "The provided booking ID is not valid." });
   }

  const booking = await Booking.findById(bookingId).exec();
  if (!booking) {
    return res.status(404).json({ message: "Booking not found. Please check the booking ID." });
  }
    
  // Find castle
  const castle = await Castle.findById(booking.castleId);
  if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }
  const isBookingCreator = booking.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isOwner = castle.owner._id.toString() === req.user._id.toString();
  // User's booking
  if (!isBookingCreator && !isAdmin && !isOwner) {
    return res.status(403).json({ message: "You do not have permission to access this booking." });
  }
  
  res.status(200).json(booking);
};

// Update Booking
export const updateBooking = async (req,res) => {
  const { bookingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "The provided booking ID is not valid." });
  }

  // Allowed fields to be updated
  const fieldsToUpdate = ["checkInDate", "checkOutDate", "guests"];
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

  // Update booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found. Please check the booking ID." });
  }

  // Calculate number of nights
  const checkIn = new Date(toUpdate.checkInDate || booking.checkInDate);
  const checkOut = new Date(toUpdate.checkOutDate || booking.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  if (isNaN(nights) || nights <= 0) {
    return res.status(400).json({ message: "Invalid check-in or check-out date." });
  }

  // Find room
  const room = await Room.findById(booking.roomId);
  if (!room) {
    res.status(404).json({ message: "Room not found. Please check the room ID." });
  }

  // Calculate total price
  toUpdate.totalPrice = room.price * nights;

  // Find castle
  const castle = await Castle.findById(booking.castleId).exec();

  if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }

  const updatedBooking = await Booking.findByIdAndUpdate(bookingId, toUpdate, { new: true }).exec();
  if (!updateBooking) {
    res.status(404).json({ message: "Booking not found. Please check the booking ID." });
  }

  // Only admin, the owner of the castle or the booking creator can update
  const isBookingCreator = booking.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isOwner = castle.owner._id.toString() === req.user._id.toString();
  if (!isBookingCreator && !isAdmin && !isOwner) {
    return res.status(403).json({ message: "You do not have permission to create this room." });
  }

  res.status(200).json(updatedBooking);
};

// Delete Booking
export const deleteBooking = async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Booking not found. Please check the booking ID." });
  }
  
  const booking = await Booking.findByIdAndDelete(bookingId).exec();
  
  if (!booking) {
    return res.status(404).json({ message: "Booking not found. Please check the booking ID." });
  }
  
  // Find castle
  const castle = await Castle.findById(booking.castleId).exec();
  if (!castle) {
    return res.status(404).json({ message: "Castle not found. Please check the castle ID." });
  }

  // Only admin or the same owner can delete booking
  const isBookingCreator = booking.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isOwner = castle.owner._id.toString() === req.user._id.toString();
  if (!isBookingCreator && !isAdmin && !isOwner) {
    return res.status(403).json({ message: "You do not have permission to delete this booking." });
  }

  res.status(200).json({ message: "The booking has been deleted successfully." });
};