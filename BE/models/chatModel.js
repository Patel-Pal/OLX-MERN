const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    productId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);