const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { authenticate, verifyAdmin } = require('../middleware/authMiddleware');

// Get admin dashboard stats
router.get('/stats', authenticate, verifyAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
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

// Get all buyers with their purchased products and total spent
router.get('/buyers', authenticate, verifyAdmin, async (req, res) => {
  try {
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$billDetails.amount' } } }
    ]);

    const buyers = await User.find({ role: 'buyer' }).lean();
    const buyerIds = buyers.map(buyer => buyer._id);

    const orders = await Order.find({
      buyerId: { $in: buyerIds },
      paymentStatus: 'completed'
    })
      .populate('productId', 'title price category')
      .lean();

    const buyerData = buyers.map(buyer => {
      const buyerOrders = orders.filter(order => order.buyerId.toString() === buyer._id.toString());
      const totalSpent = buyerOrders.reduce((sum, order) => sum + (order.billDetails.amount || 0), 0);
      const products = buyerOrders.map(order => ({
        _id: order.productId._id,
        title: order.productId.title,
        price: order.productId.price,
        category: order.productId.category,
        purchaseDate: order.billDetails.paymentDate
      }));

      return {
        ...buyer,
        totalProducts: buyerOrders.length,
        totalSpent,
        products
      };
    });

    res.status(200).json({
      totalBuyers,
      totalRevenue: totalRevenue[0]?.total || 0,
      buyers: buyerData
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buyer data' });
  }
});

// Get all sellers with their listed products and total revenue
router.get('/sellers', authenticate, verifyAdmin, async (req, res) => {
  try {
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$billDetails.amount' } } }
    ]);

    const sellers = await User.find({ role: 'seller' }).lean();
    const sellerIds = sellers.map(seller => seller._id);

    const products = await Product.find({ sellerId: { $in: sellerIds } })
      .select('title price category isSold isActive sellerId')
      .lean();

    const orders = await Order.find({
      sellerId: { $in: sellerIds },
      paymentStatus: 'completed'
    })
      .select('sellerId productId billDetails')
      .lean();

    const sellerData = sellers.map(seller => {
      const sellerProducts = products.filter(product => product.sellerId && product.sellerId.toString() === seller._id.toString());
      const sellerOrders = orders.filter(order => order.sellerId && order.sellerId.toString() === seller._id.toString());
      const totalRevenue = sellerOrders.reduce((sum, order) => sum + (order.billDetails?.amount || 0), 0);

      const productsWithSoldDate = sellerProducts.map(product => {
        const relatedOrder = orders.find(order => 
          order.productId && order.productId.toString() === product._id.toString()
        );
        return {
          ...product,
          soldDate: relatedOrder ? relatedOrder.billDetails?.paymentDate : undefined
        };
      });

      return {
        ...seller,
        totalProducts: sellerProducts.length,
        totalRevenue,
        products: productsWithSoldDate
      };
    });

    res.status(200).json({
      totalSellers,
      totalRevenue: totalRevenue[0]?.total || 0,
      sellers: sellerData
    });
  } catch (err) {
    console.error('Error in /sellers:', err.stack);
    res.status(500).json({ message: 'Failed to fetch seller data' });
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

// Toggle product active status
router.put('/product/:id/toggle', authenticate, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, product });
  } catch {
    res.status(500).json({ message: 'Failed to update product status' });
  }
});

module.exports = router;