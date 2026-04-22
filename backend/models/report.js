const ReportSchema = new Schema({
  reporter_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  reportable_type: {
    type: String,
    enum: ['user', 'donation', 'community_post'],
    required: true
  },

  reportable_id: {
    type: Schema.Types.ObjectId,
    required: function () {
      return !!this.reportable_type;
    }
  },

  reason: {
    type: String,
    enum: [
      'makanan_basi',
      'info_tidak_akurat',
      'penipuan',
      'konten_kasar',
      'lainnya'
    ],
    required: true
  },

  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },

  resolved_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  resolved_at: {
    type: Date
  }

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index
ReportSchema.index({ reportable_type: 1, reportable_id: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ reporter_id: 1 });
ReportSchema.index({ created_at: -1 });
ReportSchema.index(
  { reporter_id: 1, reportable_type: 1, reportable_id: 1 },
  { unique: true }
);


export default mongoose.model('Report', ReportSchema);