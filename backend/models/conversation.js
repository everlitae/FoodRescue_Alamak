const MessageSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  content: {
    type: String
  },

  message_type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },

  attachment_url: {
    type: String
  },

  is_read: {
    type: Boolean,
    default: false
  },

  read_at: {
    type: Date
  },

  is_deleted_by_sender: {
    type: Boolean,
    default: false
  },

  created_at: {
    type: Date,
    default: Date.now
  }

}, { _id: true });

const ConversationSchema = new Schema({
  donation_id: {
    type: Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },

  provider_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  seeker_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  last_message_at: {
    type: Date
  },

  provider_unread: {
    type: Number,
    default: 0
  },

  seeker_unread: {
    type: Number,
    default: 0
  },

  is_archived: {
    type: Boolean,
    default: false
  },

  messages: {
    type: [MessageSchema],
    default: []
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

// Index
ConversationSchema.index({ provider_id: 1, last_message_at: -1 });
ConversationSchema.index({ seeker_id: 1, last_message_at: -1 });
ConversationSchema.index({ donation_id: 1 });

export default mongoose.model('Conversation', ConversationSchema);