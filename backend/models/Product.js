const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shop:          { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name:          { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  image:         { type: String, default: '' },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  category:      { type: String, default: 'General' },
  isVeg:         { type: Boolean, default: true },
  inStock:       { type: Boolean, default: true },
  isActive:      { type: Boolean, default: true },
  quantity:      { type: String, default: '' },
  stockQty:      { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
