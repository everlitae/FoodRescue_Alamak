const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(50);

    const unread_count = await Notification.countDocuments({
      user_id: req.user.id,
      is_read: false,
    });

    res.json({ notifications, unread_count });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notifikasi tidak ditemukan' });
    if (notification.user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Akses ditolak' });
    }

    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();

    res.json({ msg: 'Notifikasi ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { is_read: true, read_at: new Date() }
    );
    res.json({ msg: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notifikasi tidak ditemukan' });
    if (notification.user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Akses ditolak' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Notifikasi dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/notifications
router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user_id: req.user.id });
    res.json({ msg: 'Semua notifikasi dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;