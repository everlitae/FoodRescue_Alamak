const AchievementSchema = new Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  description: String,

  icon_emoji: String,

  condition_type: {
    type: String,
    enum: ['total_donations', 'food_saved_kg', 'total_claims'],
    required: true
  },

  condition_value: {
    type: Number,
    required: true,
    min: 1
  },

  points_reward: {
    type: Number,
    default: 0
  },

  is_active: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// INDEX
AchievementSchema.index({ slug: 1 });
AchievementSchema.index({ condition_type: 1 });

export default mongoose.model('Achievement', AchievementSchema);