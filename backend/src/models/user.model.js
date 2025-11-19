import mongoose from "mongoose";
import ROLES from "../constants/roles.js";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: [...Object.values(ROLES)], default: ROLES.GUEST },
  image: { type: String },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;