const Shop    = require('../models/Shop');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const User    = require('../models/User');
const bcrypt  = require('bcryptjs');
const path    = require('path');

const fileUrl = (req, file) => {
  if (!file) return '';
  if (file.path && file.path.startsWith('http')) return file.path; // cloudinary
  return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
};

// Parse JSON address string from FormData uploads
const parseAddress = (body) => {
  if (typeof body.address === 'string') {
    try { body.address = JSON.parse(body.address); } catch {}
  }
  return body;
};

// ─── Shop ───────────────────────────────────────────────────────────────────

exports.createShop = async (req, res) => {
  try {
    const existing = await Shop.findOne({ owner: req.user._id });
    if (existing)
      return res.status(400).json({ message: 'You already have a shop. Update it instead.' });

    parseAddress(req.body);
    const shopData = { ...req.body, owner: req.user._id };
    if (req.file) shopData.image = fileUrl(req, req.file);

    const shop = await Shop.create(shopData);
    res.status(201).json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ message: 'No shop found. Create one first.' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateShop = async (req, res) => {
  try {
    parseAddress(req.body);
    const updateData = { ...req.body };
    if (req.file) updateData.image = fileUrl(req, req.file);

    const shop = await Shop.findOneAndUpdate(
      { owner: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleShopOpen = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    shop.isOpen = !shop.isOpen;
    await shop.save();
    res.json({ message: `Shop is now ${shop.isOpen ? 'Open' : 'Closed'}`, isOpen: shop.isOpen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Products ───────────────────────────────────────────────────────────────

exports.addProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ message: 'Create a shop first before adding products' });

    const productData = { ...req.body, shop: shop._id };
    if (req.file) productData.image = fileUrl(req, req.file);

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.json([]);
    const products = await Product.find({ shop: shop._id }).sort('-createdAt');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, shop: shop._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updateData = { ...req.body };
    if (req.file) updateData.image = fileUrl(req, req.file);

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, shop: shop._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.inStock = !product.inStock;
    await product.save();
    res.json({ message: `Product is now ${product.inStock ? 'In Stock' : 'Out of Stock'}`, inStock: product.inStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Orders ─────────────────────────────────────────────────────────────────

exports.getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.json([]);

    const { status } = req.query;
    const filter = { shop: shop._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, note: note || '' } },
      },
      { new: true }
    ).populate('user', 'name phone');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Profile ────────────────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const shop = await Shop.findOne({ owner: req.user._id }).select('name address isOpen image');
    res.json({ ...user.toObject(), shop });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const update = {};
    if (name)  update.name  = name;
    if (phone) update.phone = phone;
    if (req.file) update.avatar = fileUrl(req, req.file);

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new password required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id);
    const ok   = await user.matchPassword(currentPassword);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Dashboard ──────────────────────────────────────────────────────────────

exports.getAdminDashboard = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.json({ message: 'No shop yet', hasShop: false });

    const [totalProducts, totalOrders, pendingOrders, deliveredOrders, allProducts] = await Promise.all([
      Product.countDocuments({ shop: shop._id }),
      Order.countDocuments({ shop: shop._id }),
      Order.countDocuments({ shop: shop._id, status: 'pending' }),
      Order.countDocuments({ shop: shop._id, status: 'delivered' }),
      Product.find({ shop: shop._id, isActive: true }).sort('category name'),
    ]);

    const revenue = await Order.aggregate([
      { $match: { shop: shop._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    // Stock summary
    const totalStockQty    = allProducts.reduce((s, p) => s + (p.stockQty || 0), 0);
    const totalStockValue  = allProducts.reduce((s, p) => s + (p.stockQty || 0) * p.price, 0);
    const outOfStockCount  = allProducts.filter((p) => !p.inStock || p.stockQty === 0).length;
    const lowStockProducts = allProducts.filter((p) => p.inStock && p.stockQty > 0 && p.stockQty <= 5);

    // Payment breakdown
    const paymentBreakdown = await Order.aggregate([
      { $match: { shop: shop._id } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$grandTotal' } } },
    ]);

    const recentOrders = await Order.find({ shop: shop._id })
      .sort('-createdAt').limit(5)
      .populate('user', 'name phone');

    res.json({
      hasShop: true,
      shop,
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue:    revenue[0]?.total || 0,
      totalStockQty,
      totalStockValue,
      outOfStockCount,
      lowStockProducts,
      allProducts,
      paymentBreakdown,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
