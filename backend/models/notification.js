const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'donation_claimed',
      'donation_completed',
      'donation_expiring',
      'claim_confirmed',
      'claim_cancelled',
      'new_message',
      'new_rating',
      'report_received',
      'achievement_unlocked',
    ],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String },
  reference_type: {
    type: String,
    enum: ['donation', 'claim', 'message'],
  },
  reference_id: {
    type: Schema.Types.ObjectId,
    required: function () { return !!this.reference_type; },
  },
  is_read: { type: Boolean, default: false },
  read_at: { type: Date },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
}, {
  timestamps: { createdAt: 'created_at' },
});

NotificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });
NotificationSchema.index({ user_id: 1, is_read: 1 });
NotificationSchema.index({ user_id: 1, type: 1 });
NotificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', NotificationSchema);