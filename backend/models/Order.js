const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image:    { type: String, default: '' },
});

const orderSchema = new mongoose.Schema({
  orderNumber:  { type: String, index: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop:         { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  items:        [orderItemSchema],
  totalAmount:  { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  grandTotal:   { type: Number, required: true },
  deliveryAddress: {
    street: String,
    city:   String,
    lat:    Number,
    lng:    Number,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  statusHistory: [{
    status:    String,
    timestamp: { type: Date, default: Date.now },
    note:      String,
  }],
}, { timestamps: true });

orderSchema.pre('save', function () {
  if (!this.orderNumber) {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${Date.now()}-${rand}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
