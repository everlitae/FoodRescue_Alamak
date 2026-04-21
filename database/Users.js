import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  NIK: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  full_name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email tidak valid"]
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    minlength: 6
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 6
  },

  phone_number: {
    type: String,
    trim: true,
    match: [/^(?:\+62|62|0)\d{9,13}$/, "Nomor tidak valid"]
  },

  address: {
    type: String,
    trim: true
  },
  birthdate: Date,
  current_employment: {
    type: String,
    trim: true
  },
  salary: {
    type: Number,
    default: 0
  },
  marriage_status: {
    type: String,
    default: "Single"
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});


// Hash Password
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// Compare Password
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

const Users = mongoose.model("Users", userSchema);

export default Users;