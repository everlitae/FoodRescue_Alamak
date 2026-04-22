import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const AddressSchema = new Schema(
  {
    label: { type: String, trim: true },
    address_line: { type: String, required: true },
    district: { type: String },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postal_code: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    is_primary: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { _id: true },
);

const ProfileSchema = new Schema(
  {
    bio: { type: String, maxlength: 500 },
    total_donations: { type: Number, default: 0 },
    total_claims: { type: Number, default: 0 },
    total_recipients: { type: Number, default: 0 },
    success_rate: { type: Number, default: null },
    food_saved_kg: { type: Number, default: 0 },
    co2_saved_kg: { type: Number, default: 0 },
    notification_email: { type: Boolean, default: true },
    notification_push: { type: Boolean, default: true },
  },
  { _id: false },
);

// MAIN SCHEMA: USER
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
    NIK: { type: String, unique: true, sparse: true },
    birthdate: Date,
    current_employment: String,
    salary: { type: Number, default: 0 },
    marriage_status: { type: String, default: "Single" },
    city: String,
    avatar_url: String,
    is_verified: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    trust_score: { type: Number, default: 5.0, min: 1, max: 5 },
    total_points: { type: Number, default: 0 },
    last_login_at: Date,
    email_verified_at: Date,
    deleted_at: { type: Date, default: null },
    profile: ProfileSchema,
    addresses: [AddressSchema],
    achievements: [
      {
        achievement_id: String,
        unlocked_at: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// INDEX
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ city: 1 });
UserSchema.index({ "addresses.location": "2dsphere" });

// HASH PASSWORD
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();

  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

// COMPARE PASSWORD
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

export default mongoose.model("User", UserSchema);
