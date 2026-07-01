const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.get('/shops/nearby', ctrl.getNearbyShops);
router.get('/shops/search', ctrl.searchShops);
router.get('/shop/:shopId', ctrl.getShopById);
router.get('/shop/:shopId/products', ctrl.getShopProducts);

router.post('/order', protect, ctrl.placeOrder);
router.get('/orders', protect, ctrl.getMyOrders);
router.get('/order/:orderId', protect, ctrl.getOrderById);
router.patch('/order/:orderId/cancel', protect, ctrl.cancelOrder);

module.exports = router;
