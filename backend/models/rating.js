const RatingSchema = new Schema({
  claim_id: {
    type: Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
    unique: true
  },

  rater_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  ratee_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  review: {
    type: String,
    trim: true,
    maxlength: 1000
  }

}, {
  timestamps: { createdAt: 'created_at' }
});

// Index
RatingSchema.index({ ratee_id: 1 });
RatingSchema.index({ rater_id: 1 });
RatingSchema.pre("save", function (next) {
  if (this.rater_id.equals(this.ratee_id)) {
    return next(new Error("User cannot rate themselves"));
  }
  next();
});

export default mongoose.model('Rating', RatingSchema);