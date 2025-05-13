const userSocketMap = {};

const connectedUsers = new Map(); // userId -> socket.id
const userRooms = new Map();      // roomId -> Set<userId>

let currentPoll = {
  question: '',
  options: [],
  votes: {},
  timer: 30,
  correctOption: null,
  startTimer: false
};

module.exports = (io) => {

  const users = {}; // Maps userId to socket.id
  const rooms = {}; // Maps roomId to array of userIds

  io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    // Room Join
    // socket.on('join-room', (data) => {
    //   let roomId = typeof data === 'string' ? data : data.roomId;
    //   let userId = data.userId || socket.id;
    //   if (!roomId) return;

    //   socket.join(roomId);
    //   userSocketMap[userId] = socket.id;
    //   socket.to(roomId).emit('user-joined', userId);
    // });

    // Drawing, Text, Shapes, File Upload, Pages, Undo/Redo
    socket.on('drawing', ({ roomId, ...drawData }) => roomId && socket.to(roomId).emit('drawing', drawData));
    socket.on('text', ({ roomId, textData }) => roomId && socket.to(roomId).emit('text', textData));
    socket.on('shape', ({ roomId, shapeData }) => roomId && socket.to(roomId).emit('shape', shapeData));
    // socket.on('upload-file', ({ roomId, imageData }) => roomId && socket.to(roomId).emit('upload-file', imageData));
    socket.on ('upload-image', ({ roomId, imageData}) => {
      socket.to(roomId).emit('receive-image', imageData);
    });
    socket.on('new-page', roomId => roomId && socket.to(roomId).emit('new-page'));
    socket.on('previous-page', roomId => roomId && socket.to(roomId).emit('previous-page'));
    socket.on('clear-canvas', roomId => roomId && socket.to(roomId).emit('clear-canvas'));
    socket.on('undo', ({ roomId, image }) => roomId && socket.to(roomId).emit('undo', { image }));
    socket.on('redo', ({ roomId, image }) => roomId && socket.to(roomId).emit('redo', { image }));
    socket.on("add-text", ({ roomId, text, x, y, color }) => {
      socket.to(roomId).emit("add-text", { text, x, y, color });
    });
    
    // Canvas sync
    socket.on('send-canvas-state', ({ roomId, image }) => {
      if (roomId) socket.to(roomId).emit('receive-canvas-state', { image });
    });

    // Polling
    socket.emit('pollData', currentPoll);

    socket.on('createPoll', (data) => {
      currentPoll = { ...data, votes: {} };
      io.emit('pollData', currentPoll);
    });

    socket.on('castVote', (index) => {
      currentPoll.votes[index] = (currentPoll.votes[index] || 0) + 1;
      io.emit('voteUpdate', { votes: currentPoll.votes });
    });

    socket.on('timerTick', ({ timer }) => {
      currentPoll.timer = timer;
      io.emit('timerUpdate', { timer });
    });

    socket.on('markCorrect', (index) => {
      currentPoll.correctOption = index;
      io.emit('correctOption', { index });
    });

    // Chat
    socket.on("send-chat", (msg) => {
      socket.broadcast.emit('receive-chat', msg);
    });

    // Video Call
    
socket.on('join-room', ({ roomId, userId }) => {
      users[userId] = socket.id;
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      rooms[roomId].push(userId);

      // Notify other users in the room
      socket.to(roomId).emit('user-joined', { userId });
    });

    socket.on('start-call', ({ roomId, fromUserId }) => {
      socket.to(roomId).emit('incoming-call', { from: fromUserId });
    });

    socket.on('accept-call', ({ fromUserId, toUserId }) => {
      const toSocketId = users[toUserId];
      if (toSocketId) {
        io.to(toSocketId).emit('call-accepted', { from: fromUserId });
      }
    });

    socket.on('offer', ({ offer, toUserId, fromUserId }) => {
      const toSocketId = users[toUserId];
      if (toSocketId) {
        io.to(toSocketId).emit('offer', { offer, from: fromUserId });
      }
    });

    socket.on('answer', ({ answer, toUserId, fromUserId }) => {
      const toSocketId = users[toUserId];
      if (toSocketId) {
        io.to(toSocketId).emit('answer', { answer, from: fromUserId });
      }
    });

    socket.on('ice-candidate', ({ candidate, toUserId }) => {
      const toSocketId = users[toUserId];
      if (toSocketId) {
        io.to(toSocketId).emit('ice-candidate', { candidate });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      // Remove user from users and rooms
      for (const [userId, id] of Object.entries(users)) {
        if (id === socket.id) {
          delete users[userId];
          for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== userId);
            // Notify other users in the room
            socket.to(roomId).emit('user-left', { userId });
          }
          break;
        }
      }
    });


    // Disconnect
    socket.on('disconnecting', () => {
      [...socket.rooms].filter(r => r !== socket.id).forEach(roomId => {
        socket.to(roomId).emit('user-disconnected', socket.id);
      });
    });

    socket.on('disconnect', () => {
      for (const [uid, sid] of Object.entries(userSocketMap)) {
        if (sid === socket.id) delete userSocketMap[uid];
      }
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
};


