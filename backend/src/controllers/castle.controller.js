import mongoose from "mongoose";
import Castle from "../models/castel.model.js";

// Create a Castle
export const createCastle = async (req, res, next) => {
  const { name, description, owner, address, events, images, facilities, amenities, rooms, checkIn, checkOut, cancellationPolicy, houseRules, safetyFeatures } = req.body;

  // Validation
  const requiredFields = { name, description, address, images, rooms, checkIn, checkOut };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({ message: `The '${key}' field is required.` });
    }
  };

  const castle = await Castle.create({ name, description, owner, address, events, images, facilities, amenities, rooms, checkIn, checkOut, cancellationPolicy, houseRules, safetyFeatures });
  res.status(201).json(castle);
};

// Get all Castles
export const getAllCastles = async (req, res) => {
  const castles = await Castle.find().exec();
  res.status(200).json(castles);
}

// Get Castle by id
export const getCastleById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const castle = await Castle.findById(id).exec();
  res.status(200).json(castle);
}

//Update
export const updateCastle = async (req,res) => {
  const { id } = req.params;

  const fieldsToUpdate = ["name", "description", "owner", "address", "events", "images", "facilities", "amenities", "rooms", "checkIn", "checkOut", "cancellationPolicy", "houseRules", "safetyFeatures"];
  const toUpdate = {};
  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      toUpdate[field] = req.body[field];
    }
  });
  
  if (Object.keys(toUpdate).length === 0) {
    return res.status(400).json({ message: "You did not make any changges!" });
  }

  const updatedCastle = await Castle.findByIdAndUpdate(id, toUpdate, { new: true }).exec();

  if (!updatedCastle) {
    return res.status(404).json({ message: "Castle not found." });
  }
  
  res.status(200).json(updatedCastle);
}

// Delete
export const deleteCastle = async (req, res) => {
   const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const castle = await Castle.findByIdAndDelete(id).exec();

  if (!castle) {
    return res.status(404).json({ message: "Castle not found." });
  }

  res.status(200).json({ message: "You deleted the castle successfully" });
}