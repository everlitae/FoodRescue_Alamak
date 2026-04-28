const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
  },
  { timestamps: true },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
