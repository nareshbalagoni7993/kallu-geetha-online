const router   = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl     = require('../controllers/userController');
const Category = require('../models/Category');

// Public categories list (used by home page filter and shop forms)
router.get('/categories', async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true }).sort('label');
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/shops/nearby', ctrl.getNearbyShops);
router.get('/shops/search', ctrl.searchShops);
router.get('/shop/:shopId', ctrl.getShopById);
router.get('/shop/:shopId/products', ctrl.getShopProducts);

router.post('/order', protect, ctrl.placeOrder);
router.get('/orders', protect, ctrl.getMyOrders);
router.get('/order/:orderId', protect, ctrl.getOrderById);
router.patch('/order/:orderId/cancel', protect, ctrl.cancelOrder);

module.exports = router;
