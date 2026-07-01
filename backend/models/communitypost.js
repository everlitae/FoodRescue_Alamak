const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  like_count: { type: Number, default: 0 },
  liked_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
}, { _id: true });

const CommunityPostSchema = new Schema({
  author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['tips', 'success_story', 'question', 'discussion', 'announcement'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  cover_image_url: String,
  tags: [{ type: String, lowercase: true, trim: true }],
  like_count: { type: Number, default: 0 },
  liked_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comment_count: { type: Number, default: 0 },
  view_count: { type: Number, default: 0 },
  is_pinned: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null },
  comments: {
    type: [CommentSchema],
    default: [],
    validate: [(arr) => arr.length <= 100, 'Max 100 comments'],
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

CommunityPostSchema.index({ author_id: 1 });
CommunityPostSchema.index({ type: 1, created_at: -1 });
CommunityPostSchema.index({ tags: 1 });
CommunityPostSchema.index({ title: 'text', content: 'text' });
CommunityPostSchema.index({ is_pinned: 1, created_at: -1 });
CommunityPostSchema.index({ like_count: -1 });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);