const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  value:    { type: String, required: true, unique: true, trim: true },
  label:    { type: String, required: true, trim: true },
  icon:     { type: String, default: '🏪' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
