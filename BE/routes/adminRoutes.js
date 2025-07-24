const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { authenticate, verifyAdmin } = require('../middleware/authMiddleware');

// Get admin dashboard stats
router.get('/stats', authenticate, verifyAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$billDetails.amount' } } }
    ]);

    res.status(200).json({ 
      totalProducts, 
      totalBuyers, 
      totalSellers,
      totalRevenue: totalRevenue[0]?.total || 0 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get all users (buyers/sellers)
router.get('/users/:role', authenticate, verifyAdmin, async (req, res) => {
  const { role } = req.params;
  try {
    const users = await User.find({ role });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get all products
router.get('/products', authenticate, verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'name email');
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get sold products with revenue details
router.get('/revenue', authenticate, verifyAdmin, async (req, res) => {
  try {
    const soldOrders = await Order.find({ paymentStatus: 'completed' })
      .populate('productId', 'title price')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');
    
    res.json(soldOrders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch revenue data' });
  }
});

// Toggle user active status
router.put('/user/:id/toggle', authenticate, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// DELETE a product by ID
router.delete('/product/:id', authenticate, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Toggle product visibility (mark as sold or not)
router.put('/product/:id/toggle', authenticate, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.isSold = !product.isSold;
    await product.save();
    res.json({ success: true, product });
  } catch {
    res.status(500).json({ message: 'Failed to update product status' });
  }
});

module.exports = router;