const mongoose = require("mongoose");

const { Schema } = mongoose;

const FoodCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon_emoji: { type: String },
    color_hex: {
      type: String,
      match: [/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color"],
    },
    description: { type: String },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FoodCategory", FoodCategorySchema);
