const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    billDetails: {
      invoiceId: { type: String },
      amount: { type: Number },
      currency: { type: String, default: 'INR' },
      paymentDate: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);