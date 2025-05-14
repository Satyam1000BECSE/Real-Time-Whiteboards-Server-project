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
const allowedOrigins = [
  'http://localhost:5173',
  'https://real-time-whiteboards-server-project-satyammourya-ui.vercel.app', // Replace with your actual frontend URL
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

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






