const express = require('express');
const router = express.Router();
const { createOrder,
    getBuyerOrders,
    getSellerOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { verifyToken, verifySeller } = require('../middleware/authMiddleware');

// Create order (buyer)
router.post('/create', verifyToken, createOrder);

// Get buyer's order history
router.get('/buyer', verifyToken, getBuyerOrders);

// Get seller's order requests
router.get('/seller', verifyToken, verifySeller, getSellerOrders);

// Update order status (accept/reject)
router.put('/:id/status', verifyToken, verifySeller, updateOrderStatus);

module.exports = router;