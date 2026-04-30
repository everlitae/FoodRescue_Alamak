const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const { auth } = require("../middleware/auth");

// GET /api/conversations — ambil semua conversation user
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

// GET /api/conversations/:id — ambil 1 conversation + messages
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

// POST /api/conversations — buat atau ambil conversation
router.post("/", auth, async (req, res) => {
  try {
    const { donation_id, receiver_id } = req.body;

    // Tentukan siapa provider dan siapa seeker
    let provId, seekId;
    if (donation_id) {
      const don = await require("../models/Donation").findById(donation_id);
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

    // Cari conversation yang sudah ada
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

// POST /api/conversations/:id/messages — kirim pesan
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

    const io = req.app.get("io");
    io.to(req.params.id).emit("new_message", newMessage);
    io.emit("new_message_navbar"); // ← untuk update badge navbar realtime

    // Notifikasi ke penerima
    const receiverId = isProvider
      ? conversation.seeker_id
      : conversation.provider_id;
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

// DELETE /api/conversations/:id/messages/:msgId — hapus pesan (sender only)
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

// PUT /api/conversations/:id/archive — arsipkan conversation
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
