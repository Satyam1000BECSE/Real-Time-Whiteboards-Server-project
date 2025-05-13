const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
require('dotenv').config();

require('./Models/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/products', require('./routes/ProductsRouter'));
app.use('/api/session', require('./routes/session'));
app.use('/api/rooms', require('./routes/rooms'));

// MongoDB
mongoose.connect(process.env.MONGO_CONN, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// WebSocket logic
require('./socket/socketHandlers')(io);

// Root route
app.get('/', (req, res) => {
  res.send('Whiteboard server is running');
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//main code
// const express = require('express');
// const mongoose = require('mongoose');
// const http = require('http');
// const cors = require('cors');
// const app = express();
// const bodyParser = require('body-parser');
// require('dotenv').config();
// require('./Models/db');
// const { Server } = require('socket.io');
// const sessionRoutes = require('./routes/session');
// const authRoutes = require('./routes/authRoutes');
// const ProductsRouter = require('./routes/ProductsRouter');



// app.use(cors());
// app.use(express.json());
// app.use('/auth', authRoutes);
// app.use('/products', ProductsRouter)
// app.use('/api/session', sessionRoutes);
// app.use(bodyParser.json());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//   }
// });

// let currentPoll = {
//   question: '',
//   options: [],
//   votes: {},
//   timer: 30,
//   correctOption: null,
//   startTimer: false
// };

// app.use(cors({ 
//     origin: 'http://localhost:5173', 
//     methods: ['GET', 'POST'], 
// })); 

// app.use(express.json());

// const roomRoutes = require('./routes/rooms'); 
// app.use('/api/rooms', roomRoutes);

// const userSocketMap = {}; // userId -> socket.id

// mongoose.connect(process.env.MONGO_CONN, { 
//     useNewUrlParser: true, 
//     useUnifiedTopology: true, 
// }) 
// .then(() => console.log('MongoDB connected')) 
// .catch(err => console.error('MongoDB connection error:', err));

// // ✅ 2. WebSocket Events for Real-time Collaboration
// io.on('connection', (socket) => {
//   console.log(`🔌 User connected: ${socket.id}`);

//     socket.on('join-room', (data) => {
//   let roomId, userId;

//   // Support both: string or object input
//   if (typeof data === 'string') {
//     roomId = data;
//   } else {
//     roomId = data.roomId;
//     userId = data.userId;
//   }

//   if (!roomId) return;

//   socket.join(roomId);
//   console.log(`👥 ${socket.id} joined room ${roomId}`);

//   if (userId) {
//     userSocketMap[userId] = socket.id;
//     socket.to(roomId).emit('user-joined', userId);
//   } else {
//     socket.to(roomId).emit('user-joined', socket.id);
//   }
// });

//   // // Join room
//   // socket.on('join-room', (roomId) => {
//   //   if (!roomId) return;
//   //   socket.join(roomId);
//   //   console.log(`👥 ${socket.id} joined room ${roomId}`);
//   //   socket.to(roomId).emit('user-joined', socket.id);
//   // });

//   // console.log('User connected:', socket.id); this my room code
  
//   // socket.on('join-room', (roomId) => {
//   //   socket.join(roomId);
//   //   console.log(`User ${socket.id} joined room ${roomId}`);
//   //   socket.to(roomId).emit('user-joined', socket.id);
//   // });

//   // Drawing (Pencil / Eraser)
//   socket.on('drawing', ({ roomId, ...drawData }) => {
//     if (roomId) socket.to(roomId).emit('drawing', drawData);
//   });

//   // Text Tool
//   socket.on('text', ({ roomId, textData }) => {
//     if (roomId) socket.to(roomId).emit('text', textData);
//   });

//   // Shapes (Line, Rectangle, Circle, Arrow, Triangle, Polygon)
//   socket.on('shape', ({ roomId, shapeData }) => {
//     if (roomId) socket.to(roomId).emit('shape', shapeData);
//   });

//   // Upload File
//   socket.on('upload-file', ({ roomId, imageData }) => {
//     if (roomId) socket.to(roomId).emit('upload-file', imageData);
//   });

//   // New Page
//   socket.on('new-page', (roomId) => {
//     if (roomId) socket.to(roomId).emit('new-page');
//   });

//   // Previous Page
//   socket.on('previous-page', (roomId) => {
//     if (roomId) socket.to(roomId).emit('previous-page');
//   });

//   // Clear Canvas
//   socket.on('clear-canvas', (roomId) => {
//     if (roomId) socket.to(roomId).emit('clear-canvas');
//   });

//   // Undo
//   socket.on('undo', ({ roomId, image }) => {
//     if (roomId) socket.to(roomId).emit('undo', { image });
//   });

//   // Redo
//   socket.on('redo', ({ roomId, image }) => {
//     if (roomId) socket.to(roomId).emit('redo', { image });
//   });

//   //poll
//   socket.emit('pollData', currentPoll);

//   socket.on('createPoll', (data) => {
//     currentPoll = { ...data };
//     io.emit('pollData', currentPoll);
//   });

//   socket.on('castVote', (index) => {
//     currentPoll.votes[index] = (currentPoll.votes[index] || 0) + 1;
//     io.emit('voteUpdate', { votes: currentPoll.votes });
//   });

//   socket.on('timerTick', ({ timer }) => {
//     currentPoll.timer = timer;
//     io.emit('timerUpdate', { timer });
//   });

//   socket.on('markCorrect', (index) => {
//     currentPoll.correctOption = index;
//     io.emit('correctOption', { index });
//   });


//    socket.on('start-call', ({ roomId, fromUserId }) => {
//     socket.to(roomId).emit('incoming-call', { from: fromUserId });
//   });

//   socket.on('accept-call', ({ fromUserId, toUserId }) => {
//     const toSocketId = userSocketMap[toUserId];
//     if (toSocketId) {
//       io.to(toSocketId).emit('call-accepted', { from: fromUserId });
//     }
//   });

//   socket.on('offer', ({ offer, toUserId, fromUserId }) => {
//     const toSocketId = userSocketMap[toUserId];
//     if (toSocketId) {
//       io.to(toSocketId).emit('offer', { offer, from: fromUserId });
//     }
//   });

//   socket.on('answer', ({ answer, toUserId }) => {
//     const toSocketId = userSocketMap[toUserId];
//     if (toSocketId) {
//       io.to(toSocketId).emit('answer', { answer });
//     }
//   });

//   socket.on('ice-candidate', ({ candidate, toUserId }) => {
//     const toSocketId = userSocketMap[toUserId];
//     if (toSocketId) {
//       io.to(toSocketId).emit('ice-candidate', { candidate });
//     }
//   });

//   socket.on('disconnect', () => {
//     for (const [uid, sid] of Object.entries(userSocketMap)) {
//       if (sid === socket.id) delete userSocketMap[uid];
//     }
//     console.log(`❌ User disconnected: ${socket.id}`);
//   });

  
//   //chat box
//   socket.on("send-chat", (msg) => {
//     socket.broadcast.emit('receive-chat', msg);
//   });


//   // Send Canvas State to Late Joiners
//   socket.on('send-canvas-state', ({ roomId, image }) => {
//     if (roomId) socket.to(roomId).emit('receive-canvas-state', { image });
//   });

//   // Handle Disconnection
//   socket.on('disconnecting', () => {
//     const rooms = [...socket.rooms].filter(r => r !== socket.id);
//     rooms.forEach(roomId => {
//       socket.to(roomId).emit('user-disconnected', socket.id);
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log(`❌ User disconnected: ${socket.id}`);
//   });
// });


// app.get('/', (req, res) => {
//   res.send('Whiteboard server is running');
// });

// const PORT = process.env.PORT || 8080;
// server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


// Server Side

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const app = express();
// const server = http.createServer(app);

// const bodyParser = require('body-parser');
// require('dotenv').config();
// require('./Models/db');
// const sessionRoutes = require('./routes/session');
// const authRoutes = require('./routes/authRoutes');
// const ProductsRouter = require('./routes/ProductsRouter');
// app.use('/auth', authRoutes);
// app.use('/products', ProductsRouter)
// app.use('/api/session', sessionRoutes);
// app.use(bodyParser.json());
// app.use(cors());
// app.use(express.json());


// app.use(cors({ 
//     origin: 'http://localhost:5173', 
//     methods: ['GET', 'POST'], 
// })); 
// app.use(express.json());

// const roomRoutes = require('./routes/rooms'); 
// app.use('/api/rooms', roomRoutes);

// mongoose.connect(process.env.MONGO_CONN, { 
//     useNewUrlParser: true, 
//     useUnifiedTopology: true, 
// }) 
// .then(() => console.log('MongoDB connected')) 
// .catch(err => console.error('MongoDB connection error:', err));

// const io = new Server(server, {
//   cors: {
//     origin: '*'
//   },
// });

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('join-room', (roomId) => {
//     socket.join(roomId);
//     console.log(`User ${socket.id} joined room ${roomId}`);
//     socket.to(roomId).emit('user-joined', socket.id);
//   });

//   socket.on('drawing', ({ roomId, ...drawData }) => {
//     socket.to(roomId).emit('drawing', drawData);
//   });

//   socket.on('text', ({ roomId, textData }) => {
//     socket.to(roomId).emit('text', textData);
//   });

//   socket.on('shape', ({ roomId, shapeData }) => {
//     socket.to(roomId).emit('shape', shapeData);
//   });

//   socket.on('upload-file', ({ roomId, imageData }) => {
//     socket.to(roomId).emit('upload-file', imageData);
//   });

//   socket.on('new-page', (roomId) => {
//     socket.to(roomId).emit('new-page');
//   });

//   socket.on('clear-canvas', (roomId) => {
//     socket.to(roomId).emit('clear-canvas');
//   });

//   socket.on('undo', ({ roomId, image }) => {
//     socket.to(roomId).emit('undo', { image });
//   });

//   socket.on('redo', ({ roomId, image }) => {
//     socket.to(roomId).emit('redo', { image });
//   });

//   socket.on('send-canvas-state', ({ roomId, image }) => {
//     socket.to(roomId).emit('receive-canvas-state', { image });
//   });

//   socket.on('disconnecting', () => {
//     const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
//     rooms.forEach((roomId) => {
//       socket.to(roomId).emit('user-disconnected', socket.id);
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });


// app.get('/', (req, res) => {
//   res.send('Whiteboard server is running');
// });

// const PORT = process.env.PORT || 8080;
// server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.on('join-session', (sessionId) => {
//     socket.join(sessionId);
//     console.log(`Socket ${socket.id} joined room ${sessionId}`);
//   });

//   socket.on('draw', ({ sessionId, x, y, color, tool }) => {
//     socket.to(sessionId).emit('draw', { x, y, color, tool });
//   });

//   socket.on('clear-canvas', (sessionId) => {
//     socket.to(sessionId).emit('clear-canvas');
//   });

//   socket.on('chat-message', ({ sessionId, user, message }) => {
//     socket.to(sessionId).emit('chat-message', { user, message });
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected:', socket.id);
//   });
// });


// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);
  
//     socket.on('join-room', (roomId) => {
//       socket.join(roomId);
//       console.log(`User ${socket.id} joined room ${roomId}`);
//       socket.to(roomId).emit('user-joined', socket.id);
//     });
  
  //   socket.on('drawing', ({ roomId, ...drawData }) => {
  //     socket.to(roomId).emit('drawing', drawData);
  //   });
  
  //   socket.on('text', ({ roomId, textData }) => {
  //     socket.to(roomId).emit('text', textData);
  //   });
  
  //   socket.on('shape', ({ roomId, shapeData }) => {
  //     socket.to(roomId).emit('shape', shapeData);
  //   });
  
  //   socket.on('upload-file', ({ roomId, imageData }) => {
  //     socket.to(roomId).emit('upload-file', imageData);
  //   });
  
  //   socket.on('new-page', (roomId) => {
  //     socket.to(roomId).emit('new-page');
  //   });
  
  //   socket.on('clear-canvas', (roomId) => {
  //     socket.to(roomId).emit('clear-canvas');
  //   });
  
  //   socket.on('undo', ({ roomId, image }) => {
  //     socket.to(roomId).emit('undo', { image });
  //   });
  
  //   socket.on('redo', ({ roomId, image }) => {
  //     socket.to(roomId).emit('redo', { image });
  //   });
  
  //   socket.on('send-canvas-state', ({ roomId, image }) => {
  //     socket.to(roomId).emit('receive-canvas-state', { image });
  //   });
  
  //   socket.on('disconnecting', () => {
  //     const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
  //     rooms.forEach((roomId) => {
  //       socket.to(roomId).emit('user-disconnected', socket.id);
  //     });
  //   });
  
  //   socket.on('disconnect', () => {
  //     console.log('User disconnected:', socket.id);
  //   });
  // });