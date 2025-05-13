// // === routes/rooms.js === 

const express = require('express');
const router = express.Router();
const Room = require('../Models/Room');
const { v4: uuidv4 } = require('uuid');

// CREATE room with userId
router.post('/create', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID required' });

  const roomId = uuidv4();
  const room = new Room({ roomId, users: [userId] });

  try {
    await room.save();
    res.json({ roomId });
  } catch (err) {
    console.error('Room creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// JOIN room with userId
router.post('/join', async (req, res) => {
  const { roomId, userId } = req.body;
  if (!roomId || !userId)
    return res.status(400).json({ message: 'Room ID and User ID required' });

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (!room.users.includes(userId)) {
      room.users.push(userId);
      await room.save();
    }

    res.json({ roomId });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET room info
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ roomId: room.roomId, users: room.users });
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




