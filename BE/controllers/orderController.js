const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const stripe = require('stripe');
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

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

// Create Stripe checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error('Invalid order ID:', orderId);
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId)
      .populate('productId', 'title price')
      .populate('buyerId', 'email');
    
    if (!order) {
      console.error('Order not found for ID:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status !== 'accepted') {
      console.error('Order not accepted for ID:', orderId, 'Status:', order.status);
      return res.status(400).json({ message: 'Order not accepted' });
    }
    if (order.paymentStatus === 'completed') {
      console.error('Payment already completed for order ID:', orderId);
      return res.status(400).json({ message: 'Payment already completed' });
    }

    if (!order.productId || !order.productId.title || !order.productId.price) {
      console.error('Invalid product data for order ID:', orderId, 'Product:', order.productId);
      return res.status(400).json({ message: 'Invalid product data' });
    }
    if (!order.buyerId || !order.buyerId.email) {
      console.error('Invalid buyer data for order ID:', orderId, 'Buyer:', order.buyerId);
      return res.status(400).json({ message: 'Invalid buyer data' });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: order.productId.title,
            },
            unit_amount: Math.round(order.productId.price * 100), // Ensure integer
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // success_url: `http://localhost:5173/order/${order.productId._id}?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `http://localhost:5173/order/${order.productId._id}`,
      success_url: `https://olx-mern-pi.vercel.app/order/${order.productId._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://olx-mern-pi.vercel.app/order/${order.productId._id}`,
      customer_email: order.buyerId.email,
      metadata: { orderId: orderId },
    });

    res.status(200).json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
};

// Confirm payment and generate bill
exports.confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    // console.log('Confirming payment for sessionId:', sessionId); // Log sessionId

    if (!sessionId) {
      console.error('No sessionId provided');
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await stripeInstance.checkout.sessions.retrieve(sessionId).catch(err => {
      console.error('Stripe session retrieval error:', err);
      throw new Error(`Failed to retrieve session: ${err.message}`);
    });

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      console.error('No orderId found in session metadata:', session);
      return res.status(400).json({ message: 'Order ID not found in session metadata' });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error('Invalid orderId in session metadata:', orderId);
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found for ID:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (session.payment_status === 'paid') {
      order.paymentStatus = 'completed';
      order.billDetails = {
        invoiceId: session.payment_intent,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        paymentDate: new Date(),
      };
      await order.save();
      res.status(200).json({ success: true, message: 'Payment confirmed', order });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      console.error('Payment not completed for sessionId:', sessionId, 'Payment status:', session.payment_status);
      return res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
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