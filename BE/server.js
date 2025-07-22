const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); 
const path = require('path');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Auth route
app.use('/api/auth', require('./routes/authRoutes'));

// Product route
app.use('/api/products', require('./routes/productRoutes'));

// Chat route
app.use('/api/chat', require('./routes/chatRoutes'));

// Admin route
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room based on productId
  socket.on('joinRoom', ({ productId, buyerId, sellerId }) => {
    // Normalize room by sorting buyerId and sellerId
    const sortedIds = [buyerId, sellerId].sort();
    const room = `${productId}-${sortedIds[0]}-${sortedIds[1]}`;
    socket.join(room);
    // console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ productId, senderId, receiverId, message }) => {
  try {
    if (senderId === receiverId) {
      console.error('Sender and receiver IDs cannot be the same:', { senderId, receiverId });
      return;
    }
    const Message = require('./models/chatModel');
    const newMessage = new Message({ productId, senderId, receiverId, message });
    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');
    const sortedIds = [senderId, receiverId].sort();
    const room = `${productId}-${sortedIds[0]}-${sortedIds[1]}`;
    console.log(`Emitting message to room: ${room}`, populatedMessage);
    io.to(room).emit('receiveMessage', populatedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
  }
});

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));