const express = require('express');
const router = express.Router();
const Message = require('../models/chatModel');
const { authenticate } = require('../middleware/authMiddleware');

// Get chat history for a product between buyer and seller
router.get('/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      productId,
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unique buyers who have messaged for a specific product
router.get('/:productId/buyers', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      productId,
      receiverId: userId, // Only get messages where the user is the receiver (i.e., seller)
    })
      .populate('senderId', 'name email')
      .sort({ createdAt: 1 });

    // Extract unique buyers
    const buyerList = messages
      .map((msg) => ({
        id: msg.senderId._id.toString(),
        name: msg.senderId.name,
      }))
      .filter(
        (value, index, self) =>
          self.findIndex((v) => v.id === value.id) === index
      );

    res.status(200).json({ success: true, buyers: buyerList });
  } catch (error) {
    console.error('Error fetching buyers for product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat status and buyers for multiple products
router.post('/status', authenticate, async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user.id;

    const chatData = await Promise.all(
      productIds.map(async (productId) => {
        const messages = await Message.find({
          productId,
          $or: [{ senderId: userId }, { receiverId: userId }],
        })
          .populate('senderId', 'name email')
          .populate('receiverId', 'name email');

        const hasChat = messages.some((msg) => msg.senderId._id.toString() !== userId);
        const buyerList = messages
          .filter((msg) => msg.senderId._id.toString() !== userId)
          .map((msg) => ({
            id: msg.senderId._id.toString(),
            name: msg.senderId.name,
          }))
          .filter(
            (value, index, self) =>
              self.findIndex((v) => v.id === value.id) === index
          );

        return { productId, hasChat, buyerList };
      })
    );

    res.status(200).json({ success: true, chatData });
  } catch (error) {
    console.error('Error fetching chat status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;