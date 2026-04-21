import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  NIK: {
    type: String,
    unique: true,
    sparse: true
  },
  full_name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  birthdate: {
    type: Date
  },
  current_employment: {
    type: String
  },
  salary: {
    type: Number
  },
  marriage_status: {
    type: String
  },
  created_at: {
    type: Date,
    required: true
  },
  updated_at: {
    type: Date,
    required: true
  }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ NIK: 1 }, { unique: true, sparse: true });

const Users = mongoose.model("Users", userSchema);

export default Users;