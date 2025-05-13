// === models/Room.js === 

const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  users: [
    {
      type: String
    }
  ]
});

module.exports = mongoose.model('Room', RoomSchema);



;
