const DonationSchema = new Schema(
  {
    // Relasi
    provider_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "FoodCategory",
      required: true,
    },
    category_snapshot: {
      name: String,
      icon_emoji: String,
      color_hex: String,
    },

    // Informasi Donasi
    title: { type: String, required: true, trim: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    quantity_unit: { type: String, required: true },
    quantity_remaining: { type: Number, min: 0 },
    status: {
      type: String,
      enum: [
        "available",
        "partially_claimed",
        "fully_claimed",
        "completed",
        "expired",
        "cancelled",
      ],
      default: "available",
    },
    is_halal: { type: Boolean, default: null },
    allergen_notes: { type: String },
    view_count: { type: Number, default: 0 },

    // Lokasi Pickup
    pickup_address: { type: String, required: true },
    pickup_city: { type: String, required: true },
    pickup_notes: { type: String },
    pickup_start_time: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "Format HH:mm"],
    },
    pickup_end_time: { type: String, match: [/^\d{2}:\d{2}$/, "Format HH:mm"] },
    pickup_location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },

    // Waktu
    expired_at: { type: Date, required: true },
    deleted_at: { type: Date, default: null },

    // Foto (Max 5)
    photos: {
      type: [
        {
          photo_url: { type: String, required: true },
          thumbnail_url: { type: String },
          sort_order: { type: Number, default: 0 },
          created_at: { type: Date, default: Date.now },
        },
      ],
      default: [],
      validate: [(arr) => arr.length <= 5, "Maximum 5 photos allowed"],
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// Sync
DonationSchema.pre("save", function (next) {
  if (this.isNew || this.quantity_remaining == null) {
    this.quantity_remaining = this.quantity;
  }
  if (this.expired_at && this.expired_at < new Date()) {
    this.status = "expired";
  }
  next();
});

// Index
DonationSchema.index({ pickup_location: "2dsphere" });
DonationSchema.index({ status: 1, expired_at: 1 });
DonationSchema.index({ provider_id: 1 });
DonationSchema.index({ pickup_city: 1 });
DonationSchema.index({ title: "text", description: "text" });
DonationSchema.index({ created_at: -1 });
DonationSchema.index({ expired_at: 1 });
DonationSchema.index({ deleted_at: 1 });

export default mongoose.model("Donation", DonationSchema);
