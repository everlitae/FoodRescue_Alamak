const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const Notification = require("../models/notification");
const { auth } = require("../middleware/auth");

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Ambil semua percakapan milik user login
 *     tags: [Conversations]
 *     responses:
 *       200:
 *         description: List percakapan berhasil diambil
 */
router.get("/", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ provider_id: req.user.id }, { seeker_id: req.user.id }],
      is_archived: false,
    })
      .populate("provider_id", "first_name last_name avatar_url")
      .populate("seeker_id", "first_name last_name avatar_url")
      .populate("donation_id", "title")
      .sort({ last_message_at: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     summary: Ambil detail 1 percakapan + semua pesannya (dan reset unread count)
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail percakapan berhasil diambil
 *       403:
 *         description: Bukan partisipan percakapan ini
 *       404:
 *         description: Conversation tidak ditemukan
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("provider_id", "first_name last_name avatar_url")
      .populate("seeker_id", "first_name last_name avatar_url")
      .populate("donation_id", "title status");

    if (!conversation)
      return res.status(404).json({ msg: "Conversation tidak ditemukan" });

    const isParticipant =
      conversation.provider_id._id.toString() === req.user.id ||
      conversation.seeker_id._id.toString() === req.user.id;
    if (!isParticipant) return res.status(403).json({ msg: "Akses ditolak" });

    // Reset unread count
    const isProvider = conversation.provider_id._id.toString() === req.user.id;
    if (isProvider) conversation.provider_unread = 0;
    else conversation.seeker_unread = 0;
    await conversation.save();

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Mulai/ambil percakapan dengan user lain (terkait donasi atau langsung)
 *     tags: [Conversations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiver_id]
 *             properties:
 *               donation_id: { type: string, description: "Opsional, kalau percakapan terkait donasi tertentu" }
 *               receiver_id: { type: string }
 *     responses:
 *       200:
 *         description: Conversation berhasil diambil/dibuat
 */
router.post("/", auth, async (req, res) => {
  try {
    const { donation_id, receiver_id } = req.body;

    // Tentukan siapa provider dan siapa seeker
    let provId, seekId;
    if (donation_id) {
      const don = await require("../models/donation").findById(donation_id);
      if (don && don.provider_id.toString() === req.user.id) {
        provId = req.user.id;
        seekId = receiver_id;
      } else {
        provId = receiver_id;
        seekId = req.user.id;
      }
    } else {
      provId = req.user.id;
      seekId = receiver_id;
    }

    let conversation = await Conversation.findOne({
      donation_id: donation_id || null,
      $or: [
        { provider_id: provId, seeker_id: seekId },
        { provider_id: seekId, seeker_id: provId },
      ],
    });

    if (!conversation) {
      conversation = new Conversation({
        donation_id: donation_id || null,
        provider_id: provId,
        seeker_id: seekId,
      });
      await conversation.save();
    }

    await conversation.populate(
      "provider_id",
      "first_name last_name avatar_url",
    );
    await conversation.populate("seeker_id", "first_name last_name avatar_url");
    await conversation.populate("donation_id", "title");

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   post:
 *     summary: Kirim pesan baru dalam sebuah percakapan
 *     tags: [Conversations]
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
 *               message_type: { type: string, enum: [text, image], default: text }
 *     responses:
 *       201:
 *         description: Pesan berhasil dikirim (realtime via Socket.io)
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Conversation tidak ditemukan
 */
router.post("/:id/messages", auth, async (req, res) => {
  try {
    const { content, message_type } = req.body;

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      return res.status(404).json({ msg: "Conversation tidak ditemukan" });

    const isProvider = conversation.provider_id.toString() === req.user.id;
    const isSeeker = conversation.seeker_id.toString() === req.user.id;
    if (!isProvider && !isSeeker)
      return res.status(403).json({ msg: "Akses ditolak" });

    const message = {
      sender_id: req.user.id,
      content,
      message_type: message_type || "text",
    };

    conversation.messages.push(message);
    conversation.last_message_at = new Date();

    // Update unread count penerima
    if (isProvider) conversation.seeker_unread += 1;
    else conversation.provider_unread += 1;

    await conversation.save();

    const newMessage = conversation.messages[conversation.messages.length - 1];

    const receiverId = isProvider
      ? conversation.seeker_id
      : conversation.provider_id;

    const io = req.app.get("io");

    const msgObj = newMessage.toObject();
    io.to(req.params.id).emit("new_message", {
      ...msgObj,
      sender_id: msgObj.sender_id.toString(), // ← convert ke string
      conversationId: req.params.id,
    });

    io.to(`user_${receiverId.toString()}`).emit("new_message_notify", {
      conversationId: req.params.id,
      senderId: req.user.id,
      preview: content.length > 60 ? content.substring(0, 60) + "..." : content,
    });

    await Notification.create({
      user_id: receiverId,
      type: "new_message",
      title: "Pesan Baru",
      body: content.length > 50 ? content.substring(0, 50) + "..." : content,
      reference_type: "message",
      reference_id: conversation._id,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/conversations/{id}/messages/{msgId}:
 *   delete:
 *     summary: Hapus pesan milik sendiri (soft delete)
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: msgId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pesan dihapus
 *       403:
 *         description: Bukan pesan milik user ini
 *       404:
 *         description: Conversation/pesan tidak ditemukan
 */
router.delete("/:id/messages/:msgId", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      return res.status(404).json({ msg: "Conversation tidak ditemukan" });

    const message = conversation.messages.id(req.params.msgId);
    if (!message) return res.status(404).json({ msg: "Pesan tidak ditemukan" });
    if (message.sender_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Bukan pesan kamu" });
    }

    message.is_deleted_by_sender = true;
    message.content = "Pesan telah dihapus";
    await conversation.save();

    res.json({ msg: "Pesan dihapus" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/conversations/{id}/archive:
 *   put:
 *     summary: Arsipkan percakapan
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation diarsipkan
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Conversation tidak ditemukan
 */
router.put("/:id/archive", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      return res.status(404).json({ msg: "Conversation tidak ditemukan" });

    const isParticipant =
      conversation.provider_id.toString() === req.user.id ||
      conversation.seeker_id.toString() === req.user.id;
    if (!isParticipant) return res.status(403).json({ msg: "Akses ditolak" });

    conversation.is_archived = true;
    await conversation.save();

    res.json({ msg: "Conversation diarsipkan" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;