const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');


// const orderRoutes = require('./routes/orderRoutes');


dotenv.config();

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY is not defined in the .env file');
  process.exit(1);
}

// Validate Cloudinary configuration
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.error('Error: Cloudinary configuration is missing in the .env file');
  process.exit(1);
}


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://olx-mern-pi.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
});

app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/json' })); // For Stripe webhook

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));


// Stripe webhook endpoint
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    const order = await require('./models/orderModel').findById(orderId);
    if (order && session.payment_status === 'paid') {
      order.paymentStatus = 'completed';
      order.billDetails = {
        invoiceId: session.payment_intent,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        paymentDate: new Date(),
      };
      await order.save();
    }
  }

  res.json({ received: true });
});


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