const Shop         = require('../models/Shop');
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const Notification = require('../models/Notification');

const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, category } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;

    const shops = await Shop.find(filter).populate('owner', 'name');

    let result = shops.map((shop) => {
      // Only calculate real distance if BOTH user and shop have valid coordinates
      const shopHasCoords = shop.address.lat !== 0 || shop.address.lng !== 0;
      const distance = (lat && lng && shopHasCoords)
        ? calcDistance(parseFloat(lat), parseFloat(lng), shop.address.lat, shop.address.lng)
        : 0;
      return { ...shop.toObject(), distance: parseFloat(distance.toFixed(1)) };
    });

    // Sort by distance when user location is known (shops without coords go last)
    if (lat && lng) {
      result.sort((a, b) => {
        if (a.distance === 0 && b.distance === 0) return 0;
        if (a.distance === 0) return 1;
        if (b.distance === 0) return -1;
        return a.distance - b.distance;
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).populate('owner', 'name phone');
    if (!shop || !shop.isActive) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getShopProducts = async (req, res) => {
  try {
    const products = await Product.find({
      shop: req.params.shopId,
      isActive: true,
    }).sort('category name');

    const categories = [...new Set(products.map((p) => p.category))];
    res.json({ products, categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { shopId, items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isActive || !shop.isOpen)
      return res.status(400).json({ message: 'Shop is not available' });

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (totalAmount < shop.minOrder)
      return res.status(400).json({ message: `Minimum order amount is ₹${shop.minOrder}` });

    const deliveryCharge = shop.deliveryCharge;
    const grandTotal = totalAmount + deliveryCharge;

    const order = await Order.create({
      user: req.user._id,
      shop: shopId,
      items,
      totalAmount,
      deliveryCharge,
      grandTotal,
      deliveryAddress: deliveryAddress || req.user.address,
      paymentMethod: paymentMethod || 'cod',
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    await order.populate('shop', 'name image deliveryTime owner');

    // Persist notification to DB (admin sees it even if offline)
    let savedNotif = null;
    try {
      savedNotif = await Notification.create({
        type:        'new_order',
        adminId:     shop.owner,
        orderId:     order._id,
        orderNumber: order.orderNumber,
        amount:      order.grandTotal,
        customer:    req.user.name,
        shopName:    shop.name,
        payMethod:   order.paymentMethod,
      });
    } catch (e) {
      console.error('[Notification] DB save failed:', e.message);
    }

    // Also push real-time via socket (for live updates if admin is online)
    if (global.io) {
      const payload = {
        _id:         savedNotif?._id,
        type:        'new_order',
        orderId:     order._id,
        orderNumber: order.orderNumber,
        amount:      order.grandTotal,
        customer:    req.user.name,
        shopName:    shop.name,
        payMethod:   order.paymentMethod,
        createdAt:   savedNotif?.createdAt || new Date().toISOString(),
        read:        false,
      };
      const adminRoom = `admin_${shop.owner}`;
      console.log(`[Socket] emitting new_order to room: ${adminRoom}`);
      global.io.to(adminRoom).emit('notification', payload);
      global.io.to('superadmin').emit('notification', payload);
    } else {
      console.warn('[Socket] global.io not available — live notification not sent');
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('shop', 'name image address')
      .populate('items.product', 'name image')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id })
      .populate('shop', 'name image phone address')
      .populate('items.product', 'name image');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['pending', 'confirmed'].includes(order.status))
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });

    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by user' });
    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchShops = async (req, res) => {
  try {
    const { q } = req.query;
    const shops = await Shop.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
