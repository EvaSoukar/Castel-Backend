import mongoose from "mongoose";
import ROLES from "../constants/roles.js";
import { generateToken } from "../lib/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Create user
export const register = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty. Please provide all required fields." });
  }
  const { firstName, lastName, email, phone, password } = req.body;

  // Check if all fields are filled
  const requiredFields =  { firstName, lastName, email, phone, password };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({message: `Please provide all required fields: ${key} field is required.` })
    }
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(400).json({ message: "An account with this email already exists. Please log in or use a different email." });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({ firstName, lastName, email: normalizedEmail, phone, password: hash });

  // Generate token
  const token = generateToken(user);

  // Return response
  res.status(201).json({ _id: user._id, firstName: user.firstName, lastName: user.lastName, email, phone: user.phone, token, role: user.role });
};

// Login
export const login = async (req,res) => {
  const { email, password } = req.body;

  // Check if all fields are filled
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all required fields: email and password" });
  }

  // Find user by email
  const user = await User.findOne( { email }).exec();

  // Error if no user is found
  if (!user) {
    return res.status(401).json({ message: "Incorrect email or password. Please try again." });
  }

  // Compare passwords
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Incorrect email or password. Please try again." });
  }

  // Generate token
  const token = generateToken(user);

  // Return response
  res.status(200).json({ _id: user._id, firstName: user.firstName, lastName: user.lastName, phone: user.phone, token, role: user.role });
};

// Change user role
export const updateRole = async (req, res) => {
  const { role } = req.body;

  // List of roles
  const roleArray = Object.values(ROLES);

  // Validate input
  if (!role) {
    return res.status(400).json({ message: `Please enter a role. Allowed roles are: (${roleArray.join(", ")})` });
  }

  // Normalize role
  const normalizedRole = role.trim().toLowerCase();

  // Check if role is valid
  if (!roleArray.includes(normalizedRole)) {
    return res.status(400).json({ message: `Please specify a valid role. Accepted roles are: (${roleArray.join(", ")})` });
  }

  // Find user
  const user = await User.findById(req.params.id).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found. Please check the user ID." });
  }

  // Update and save changes
  user.role = normalizedRole;
  await user.save();

  // Return response
  res.status(200).json({ message: `The user's role has been changed to ${normalizedRole}` });
};

// Get all users
export const getAllUsers = async (req, res) => {
  // Get all users(without password)
  const users = await User.find({}, "-password").exec();
  res.status(200).json(users);
};

// Profile by the same user
export const getUserProfile = async (req, res) => {
  // Find user
  const user = await User.findById(req.user._id, "-password").exec();
  if (!user) {
    return res.status(404).json({ message: "User not found. Please check the user ID." });
  }

  res.status(200).json(user);
};

// Edit User Info
export const updateUser = async (req,res) => {
  const { userId } = req.params;

  // Allowed fields to be updated
  const fieldsToUpdate = ["firstName", "lastName", "email", "phone", "password"];
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

  // Hash password
  if (toUpdate.password) {
    const salt = await bcrypt.genSalt(10);
    toUpdate.password = await bcrypt.hash(toUpdate.password, salt);
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(userId, toUpdate, { new: true }).exec();

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found. Please check the user ID." });
  }

  // Only admin or the same user can update
  const isUser = updatedUser._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isUser && !isAdmin) {
    return res.status(403).json({ message: "You do not have permission to update this user." });
  }
  
  res.status(200).json(updatedUser);
};

// Delete User by Admin or same user
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  // Check if id is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "The provided user ID is not valid." });
  }

  // Find user
  const user = await User.findById(userId).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found. Please check the user ID." });
  }

  // Only admin or the same user can delete
  const isUser = user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isUser && !isAdmin) {
    return res.status(403).json({ message: "You do not have permission to delete this user." });
  }

  // Delete User
  await User.findByIdAndDelete(userId).exec();
  res.status(200).json({ message: "The user has been deleted successfully." });
};