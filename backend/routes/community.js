const express = require("express");
const router = express.Router();
const CommunityPost = require("../models/communitypost");
const { auth } = require("../middleware/auth");

/**
 * @swagger
 * /api/community:
 *   get:
 *     summary: Ambil semua post komunitas
 *     tags: [Community]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [tips, success_story, question, discussion, announcement] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [popular, pinned] }
 *     responses:
 *       200:
 *         description: List post berhasil diambil
 */
router.get("/", async (req, res) => {
  try {
    const { type, search, sort } = req.query;
    let filter = { deleted_at: null };

    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };

    let sortOption = { created_at: -1 };
    if (sort === "popular") sortOption = { like_count: -1 };
    if (sort === "pinned") sortOption = { is_pinned: -1, created_at: -1 };

    const posts = await CommunityPost.find(filter)
      .populate("author_id", "first_name last_name avatar_url role")
      .sort(sortOption)
      .limit(50);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/community/{id}:
 *   get:
 *     summary: Ambil detail 1 post + komentarnya
 *     tags: [Community]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: noview
 *         schema: { type: string }
 *         description: Kalau diisi, view_count tidak ditambah
 *     responses:
 *       200:
 *         description: Detail post berhasil diambil
 *       404:
 *         description: Post tidak ditemukan
 */
router.get("/:id", async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate("author_id", "first_name last_name avatar_url role")
      .populate("comments.author_id", "first_name last_name avatar_url");

    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: "Post tidak ditemukan" });
    }

    if (!req.query.noview) {
      post.view_count += 1;
      await post.save();
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/community:
 *   post:
 *     summary: Buat post komunitas baru
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, content]
 *             properties:
 *               type: { type: string, enum: [tips, success_story, question, discussion, announcement] }
 *               title: { type: string }
 *               content: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               cover_image_url: { type: string }
 *     responses:
 *       201:
 *         description: Post berhasil dibuat
 */
router.post("/", auth, async (req, res) => {
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
    await post.populate("author_id", "first_name last_name avatar_url role");

    res.status(201).json({ msg: "Post berhasil dibuat!", post });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/community/{id}:
 *   put:
 *     summary: Update post milik sendiri
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               cover_image_url: { type: string }
 *     responses:
 *       200:
 *         description: Post berhasil diperbarui
 *       403:
 *         description: Bukan post milik user ini
 *       404:
 *         description: Post tidak ditemukan
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: "Post tidak ditemukan" });
    }
    if (post.author_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Bukan post kamu" });
    }

    const { title, content, tags, cover_image_url } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;
    if (cover_image_url !== undefined) post.cover_image_url = cover_image_url;

    await post.save();
    res.json({ msg: "Post diperbarui", post });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/community/{id}:
 *   delete:
 *     summary: Hapus post (pemilik post atau admin)
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Post tidak ditemukan
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: "Post tidak ditemukan" });
    }
    if (
      post.author_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }

    post.deleted_at = new Date();
    await post.save();

    res.json({ msg: "Post dihapus" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/community/{id}/like:
 *   put:
 *     summary: Like / unlike post (toggle)
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status like berhasil diubah
 *       404:
 *         description: Post tidak ditemukan
 */
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: "Post tidak ditemukan" });
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
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/community/{id}/comments:
 *   post:
 *     summary: Tambah komentar ke sebuah post
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Komentar berhasil ditambahkan
 *       400:
 *         description: Komentar tidak boleh kosong
 *       404:
 *         description: Post tidak ditemukan
 */
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim())
      return res.status(400).json({ msg: "Komentar tidak boleh kosong" });

    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ msg: "Post tidak ditemukan" });
    }

    post.comments.push({ author_id: req.user.id, content });
    post.comment_count += 1;
    await post.save();

    await post.populate(
      "comments.author_id",
      "first_name last_name avatar_url",
    );
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/community/{id}/comments/{commentId}:
 *   delete:
 *     summary: Hapus komentar (pemilik komentar atau admin)
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Komentar dihapus
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Post/komentar tidak ditemukan
 */
router.delete("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post tidak ditemukan" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment)
      return res.status(404).json({ msg: "Komentar tidak ditemukan" });
    if (
      comment.author_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }

    comment.is_deleted = true;
    comment.content = "Komentar telah dihapus";
    post.comment_count = Math.max(0, post.comment_count - 1);
    await post.save();

    res.json({ msg: "Komentar dihapus" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;