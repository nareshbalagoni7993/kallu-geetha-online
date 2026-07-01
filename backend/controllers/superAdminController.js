const User  = require('../models/User');
const Shop  = require('../models/Shop');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getDashboard = async (req, res) => {
  try {
    const [totalAdmins, totalUsers, totalShops, totalOrders, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user' }),
      Shop.countDocuments(),
      Order.countDocuments(),
      Order.find().sort('-createdAt').limit(5)
        .populate('user', 'name email')
        .populate('shop', 'name'),
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    res.json({
      totalAdmins,
      totalUsers,
      totalShops,
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      shopName, shopCategory, shopPhone,
      shopState, shopDistrict, shopMandal, shopVillage, shopPincode, shopCity,
    } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (!shopName)
      return res.status(400).json({ message: 'Shop name is required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const admin = await User.create({ name, email, password, phone, role: 'admin' });

    const city = shopDistrict || shopCity || '';
    const shop = await Shop.create({
      name:     shopName,
      owner:    admin._id,
      category: shopCategory || 'toddy_shop',
      phone:    shopPhone || phone || '',
      address:  {
        state:    shopState    || 'Telangana',
        district: shopDistrict || '',
        mandal:   shopMandal   || '',
        village:  shopVillage  || '',
        pincode:  shopPincode  || '',
        city,
        street:   shopMandal ? `${shopMandal}, ${shopVillage || ''}`.trim() : '',
        lat: 0, lng: 0,
      },
    });

    res.status(201).json({
      _id: admin._id, name: admin.name, email: admin.email, phone: admin.phone,
      role: admin.role, isActive: admin.isActive, createdAt: admin.createdAt, shop,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort('-createdAt');
    const adminsWithShop = await Promise.all(admins.map(async (admin) => {
      const shop = await Shop.findOne({ owner: admin._id }).select('name isOpen isActive');
      return { ...admin.toObject(), shop };
    }));
    res.json(adminsWithShop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    const shop = await Shop.findOne({ owner: admin._id });
    res.json({ ...admin.toObject(), shop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleAdminStatus = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin')
      return res.status(404).json({ message: 'Admin not found' });
    admin.isActive = !admin.isActive;
    await admin.save();
    res.json({ message: `Admin ${admin.isActive ? 'activated' : 'deactivated'}`, isActive: admin.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('owner', 'name email phone').sort('-createdAt');
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleShopStatus = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    shop.isActive = !shop.isActive;
    await shop.save();
    res.json({ message: `Shop ${shop.isActive ? 'activated' : 'deactivated'}`, isActive: shop.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getShopDetails = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name email phone createdAt');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const [products, totalOrders, pendingOrders, deliveredOrders, recentOrders, revenue, paymentBreakdown] = await Promise.all([
      Product.find({ shop: shop._id, isActive: true }),
      Order.countDocuments({ shop: shop._id }),
      Order.countDocuments({ shop: shop._id, status: 'pending' }),
      Order.countDocuments({ shop: shop._id, status: 'delivered' }),
      Order.find({ shop: shop._id }).sort('-createdAt').limit(5).populate('user', 'name phone'),
      Order.aggregate([{ $match: { shop: shop._id, status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      Order.aggregate([{ $match: { shop: shop._id } }, { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$grandTotal' } } }]),
    ]);

    const totalStockQty   = products.reduce((s, p) => s + (p.stockQty || 0), 0);
    const totalStockValue = products.reduce((s, p) => s + (p.stockQty || 0) * p.price, 0);
    const outOfStock      = products.filter((p) => !p.inStock || p.stockQty === 0).length;

    res.json({
      shop, products, totalOrders, pendingOrders, deliveredOrders,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders, paymentBreakdown,
      totalStockQty, totalStockValue, outOfStock,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('shop', 'name')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
