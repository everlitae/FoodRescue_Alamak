const mongoose = require('mongoose');

const { Schema } = mongoose;

const ClaimSchema = new Schema({
  donation_id: { type: Schema.Types.ObjectId, ref: 'Donation', required: true },
  seeker_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quantity_claimed: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked_up', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
  },
  pickup_scheduled_at: { type: Date },
  picked_up_at: { type: Date },
  completed_at: { type: Date },
  cancellation_reason: { type: String },
  notes: { type: String },
  tracking_log: {
    type: [{
      previous_status: { type: String },
      new_status: { type: String, required: true },
      changed_by: { type: Schema.Types.ObjectId, ref: 'User' },
      note: { type: String },
      created_at: { type: Date, default: Date.now },
    }],
    default: [],
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

ClaimSchema.index(
  { donation_id: 1, seeker_id: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed', 'picked_up'] },
    },
  }
);
ClaimSchema.index({ donation_id: 1 });
ClaimSchema.index({ seeker_id: 1 });
ClaimSchema.index({ status: 1, created_at: -1 });
ClaimSchema.index({ donation_id: 1, status: 1 });
ClaimSchema.index({ seeker_id: 1, status: 1 });

module.exports = mongoose.model('Claim', ClaimSchema);