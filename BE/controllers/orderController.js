const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.isSold) return res.status(400).json({ message: 'Product is already sold' });
    if (product.sellerId.toString() === buyerId) {
      return res.status(400).json({ message: 'You cannot buy your own product' });
    }

    const order = new Order({
      productId,
      buyerId,
      sellerId: product.sellerId,
      status: 'pending',
    });

    const savedOrder = await order.save();
    res.status(201).json({ success: true, message: 'Order request placed', order: savedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get buyer's order history
exports.getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orders = await Order.find({ buyerId })
      .populate('productId', 'title imageURL price')
      .populate('sellerId', 'name email');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get seller's order requests
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orders = await Order.find({ sellerId })
      .populate('productId', 'title imageURL price')
      .populate('buyerId', 'name email');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (accept/reject)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.sellerId.toString() !== sellerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    order.status = status;
    await order.save();

    if (status === 'accepted') {
      // Mark product as sold
      await Product.findByIdAndUpdate(order.productId, { isSold: true });

      // Reject other pending orders for the same product
      await Order.updateMany(
        { productId: order.productId, _id: { $ne: id }, status: 'pending' },
        { status: 'rejected' }
      );
    }

    res.status(200).json({ success: true, message: `Order ${status}`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};