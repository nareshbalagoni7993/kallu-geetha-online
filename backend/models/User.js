const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone:    { type: String, default: '' },
  role:     { type: String, enum: ['superadmin', 'admin', 'user'], default: 'user' },
  avatar:   { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city:   { type: String, default: '' },
    lat:    { type: Number, default: 0 },
    lng:    { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
