const User     = require('../models/User');
const Shop     = require('../models/Shop');
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { value: 'toddy_shop',    label: 'Toddy Shop',    icon: '🍺' },
  { value: 'palm_products', label: 'Palm Products',  icon: '🌴' },
  { value: 'fruit_shop',    label: 'Fruit Shop',     icon: '🍎' },
  { value: 'ice_shop',      label: 'Ice Shop',        icon: '🧊' },
  { value: 'other',         label: 'Other',           icon: '🏪' },
];

exports.getCategories = async (req, res) => {
  try {
    let cats = await Category.find({ isActive: true }).sort('label');
    if (cats.length === 0) {
      cats = await Category.insertMany(DEFAULT_CATEGORIES);
    }
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { label, icon } = req.body;
    if (!label?.trim()) return res.status(400).json({ message: 'Label is required' });
    const value = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const exists = await Category.findOne({ value });
    if (exists) return res.status(400).json({ message: 'Category already exists' });
    const cat = await Category.create({ value, label: label.trim(), icon: icon || '🏪' });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const last7DaysSA = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
  return { dateStr: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short' }) };
});
const last6MonthsSA = () => Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); d.setDate(1); d.setHours(0,0,0,0);
  return {
    monthStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    label: d.toLocaleDateString('en-US', { month: 'short' }),
  };
});

exports.getDashboard = async (req, res) => {
  try {
    const now         = new Date();
    const weekAgo     = new Date(now - 7  * 86400000);
    const twoWeeksAgo = new Date(now - 14 * 86400000);
    const sixMoAgo    = new Date(now); sixMoAgo.setMonth(sixMoAgo.getMonth() - 6);

    const [totalAdmins, totalUsers, totalShops, totalOrders,
           thisWeekAgg, lastWeekAgg, dailyRaw, monthlyRaw,
           shopPerformance, statusBreakdown, recentOrders] =
      await Promise.all([
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'user' }),
        Shop.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { createdAt: { $gte: weekAgo }, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: twoWeeksAgo, $lt: weekAgo }, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: weekAgo }, status: { $ne: 'cancelled' } } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
            revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 },
          }},
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: sixMoAgo }, status: { $ne: 'cancelled' } } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Kolkata' } },
            revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 },
          }},
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $group: { _id: '$shop', revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
          { $sort: { revenue: -1 } }, { $limit: 5 },
          { $lookup: { from: 'shops', localField: '_id', foreignField: '_id', as: 'shop' } },
          { $unwind: '$shop' },
          { $project: { shopName: '$shop.name', revenue: 1, orders: 1 } },
        ]),
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Order.find().sort('-createdAt').limit(8)
          .populate('user', 'name email').populate('shop', 'name'),
      ]);

    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    // Fill gaps
    const dayMap = {}; dailyRaw.forEach((d) => { dayMap[d._id] = d; });
    const dailyChart = last7DaysSA().map(({ dateStr, label }) => ({
      label, value: dayMap[dateStr]?.revenue || 0, orders: dayMap[dateStr]?.orders || 0,
    }));
    const monthMap = {}; monthlyRaw.forEach((m) => { monthMap[m._id] = m; });
    const monthlyChart = last6MonthsSA().map(({ monthStr, label }) => ({
      label, value: monthMap[monthStr]?.revenue || 0, orders: monthMap[monthStr]?.orders || 0,
    }));

    const thisWeekRevenue = thisWeekAgg[0]?.total || 0;
    const lastWeekRevenue = lastWeekAgg[0]?.total || 0;
    const thisWeekOrders  = thisWeekAgg[0]?.count || 0;
    const lastWeekOrders  = lastWeekAgg[0]?.count || 0;
    const revenueGrowth   = lastWeekRevenue > 0 ? (((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(1) : null;

    const statusMap = {};
    statusBreakdown.forEach((s) => { statusMap[s._id] = s.count; });

    res.json({
      totalAdmins, totalUsers, totalShops, totalOrders,
      totalRevenue: revenue[0]?.total || 0,
      thisWeekRevenue, lastWeekRevenue, thisWeekOrders, lastWeekOrders, revenueGrowth,
      dailyChart, monthlyChart, shopPerformance,
      statusBreakdown: statusMap,
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

exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateShopName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    const shop = await Shop.findByIdAndUpdate(req.params.id, { name: name.trim() }, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
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
