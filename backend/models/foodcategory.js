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

const seedCategories = [
  { name: "Makanan Siap Saji", icon_emoji: "🍚", slug: "makanan-siap-saji" },
  { name: "Roti & Pastry", icon_emoji: "🥖", slug: "roti-pastry" },
  { name: "Sayur & Buah", icon_emoji: "🥦", slug: "sayur-buah" },
  { name: "Minuman", icon_emoji: "🥤", slug: "minuman" },
  { name: "Snack", icon_emoji: "🍪", slug: "snack" },
  { name: "Frozen Food", icon_emoji: "🧊", slug: "frozen-food" },
  { name: "Makanan Bayi", icon_emoji: "👶", slug: "makanan-bayi" },
];
