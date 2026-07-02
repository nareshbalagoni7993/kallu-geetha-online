const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  type:        { type: String, default: 'new_order' },
  adminId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: String,
  amount:      Number,
  customer:    String,
  shopName:    String,
  payMethod:   String,
  read:        { type: Boolean, default: false },
}, { timestamps: true });

schema.index({ adminId: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', schema);
