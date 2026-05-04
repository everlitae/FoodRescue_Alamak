const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const { auth } = require('../middleware/auth');

// GET /api/community
router.get('/', async (req, res) => {
  try {
    const { type, search, sort } = req.query;
    let filter = { deleted_at: null };

    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };

    let sortOption = { created_at: -1 };
    if (sort === 'popular') sortOption = { like_count: -1 };
    if (sort === 'pinned') sortOption = { is_pinned: -1, created_at: -1 };

    const posts = await CommunityPost.find(filter)
      .populate('author_id', 'first_name last_name avatar_url role')
      .sort(sortOption)
      .limit(50);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/community/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author_id', 'first_name last_name avatar_url role')
      .populate('comments.author_id', 'first_name last_name avatar_url');

    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: 'Post tidak ditemukan' });
    }

    if (!req.query.noview) {
      post.view_count += 1;
      await post.save();
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/community
router.post('/', auth, async (req, res) => {
  try {
    const { type, title, content, tags, cover_image_url } = req.body;

    const post = new CommunityPost({
      author_id: req.user.id,
      type,
      title,
      content,
      tags: tags || [],
      cover_image_url,
    });

    await post.save();
    await post.populate('author_id', 'first_name last_name avatar_url role');

    res.status(201).json({ msg: 'Post berhasil dibuat!', post });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// PUT /api/community/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: 'Post tidak ditemukan' });
    }
    if (post.author_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Bukan post kamu' });
    }

    const { title, content, tags, cover_image_url } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;
    if (cover_image_url !== undefined) post.cover_image_url = cover_image_url;

    await post.save();
    res.json({ msg: 'Post diperbarui', post });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/community/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: 'Post tidak ditemukan' });
    }
    if (post.author_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Akses ditolak' });
    }

    post.deleted_at = new Date();
    await post.save();

    res.json({ msg: 'Post dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/community/:id/like
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: 'Post tidak ditemukan' });
    }

    const alreadyLiked = post.liked_by.includes(req.user.id);
    if (alreadyLiked) {
      post.liked_by.pull(req.user.id);
      post.like_count = Math.max(0, post.like_count - 1);
    } else {
      post.liked_by.push(req.user.id);
      post.like_count += 1;
    }

    await post.save();
    res.json({ liked: !alreadyLiked, like_count: post.like_count });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/community/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ msg: 'Komentar tidak boleh kosong' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: 'Post tidak ditemukan' });
    }

    post.comments.push({ author_id: req.user.id, content });
    post.comment_count += 1;
    await post.save();

    await post.populate('comments.author_id', 'first_name last_name avatar_url');
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// DELETE /api/community/:id/comments/:commentId
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post tidak ditemukan' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Komentar tidak ditemukan' });
    if (comment.author_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Akses ditolak' });
    }

    comment.is_deleted = true;
    comment.content = 'Komentar telah dihapus';
    post.comment_count = Math.max(0, post.comment_count - 1);
    await post.save();

    res.json({ msg: 'Komentar dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;