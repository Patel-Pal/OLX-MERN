const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
// const orderRoutes = require('./routes/orderRoutes');


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room based on productId, buyerId, and sellerId
  socket.on('joinRoom', ({ productId, buyerId, sellerId }) => {
    if (!productId || !buyerId || !sellerId) {
      // console.error('Invalid joinRoom parameters:', { productId, buyerId, sellerId });
      socket.emit('error', { message: 'Missing required parameters for joining room' });
      return;
    }
    if (buyerId === sellerId) {
      // console.error('Buyer and seller IDs cannot be the same:', { buyerId, sellerId });
      socket.emit('error', { message: 'Buyer and seller IDs cannot be the same' });
      return;
    }

    // Normalize room by sorting buyerId and sellerId
    const sortedIds = [buyerId, sellerId].sort();
    const room = `${productId}-${sortedIds[0]}-${sortedIds[1]}`;
    socket.join(room);
    // console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ productId, senderId, receiverId, message }) => {
    try {
      if (!productId || !senderId || !receiverId || !message) {
        // console.error('Invalid sendMessage parameters:', { productId, senderId, receiverId, message });
        socket.emit('error', { message: 'Missing required parameters for sending message' });
        return;
      }
      if (senderId === receiverId) {
        // console.error('Sender and receiver IDs cannot be the same:', { senderId, receiverId });
        socket.emit('error', { message: 'Sender and receiver IDs cannot be the same' });
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
      // console.log(`Emitting message to room: ${room}`, populatedMessage);
      io.to(room).emit('receiveMessage', populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle socket errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err.stack);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));