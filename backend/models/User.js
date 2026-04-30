const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const ProfileSchema = new Schema(
  {
    bio: { type: String, maxlength: 500 },
    total_donations: { type: Number, default: 0 },
    total_claims: { type: Number, default: 0 },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email tidak valid"],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 6,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^(?:\+62|62|0)\d{9,13}$/, "Nomor tidak valid"],
    },
    password_hash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["food_provider", "food_seeker", "admin"],
      required: true,
    },
    city: String,
    avatar_url: String,
    is_active: { type: Boolean, default: true },
    trust_score: { type: Number, default: 5.0, min: 1, max: 5 },
    total_points: { type: Number, default: 0 },
    last_login_at: Date,
    deleted_at: { type: Date, default: null },
    profile: { type: ProfileSchema, default: () => ({}) },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ city: 1 });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.model("User", UserSchema);
