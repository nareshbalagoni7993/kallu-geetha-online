const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:    {
    type: String,
    enum: ['toddy_shop', 'palm_products', 'fruit_shop', 'ice_shop', 'other'],
    default: 'toddy_shop',
  },
  address: {
    state:    { type: String, default: 'Telangana' },
    district: { type: String, default: '' },
    mandal:   { type: String, default: '' },
    village:  { type: String, default: '' },
    pincode:  { type: String, default: '' },
    street:   { type: String, default: '' },
    city:     { type: String, default: '' },
    lat:      { type: Number, default: 0 },
    lng:      { type: Number, default: 0 },
  },
  isOpen:         { type: Boolean, default: true },
  isActive:       { type: Boolean, default: true },
  deliveryTime:   { type: Number, default: 30 },
  deliveryCharge: { type: Number, default: 0 },
  minOrder:       { type: Number, default: 0 },
  rating:         { type: Number, default: 4.0 },
  totalRatings:   { type: Number, default: 0 },
  phone:          { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
