const router  = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl    = require('../controllers/adminController');
const { upload } = require('../config/cloudinary');

router.use(protect, authorize('admin', 'superadmin'));

router.get('/dashboard', ctrl.getAdminDashboard);

router.post('/shop', upload.single('image'), ctrl.createShop);
router.get('/shop', ctrl.getMyShop);
router.put('/shop', upload.single('image'), ctrl.updateShop);
router.patch('/shop/toggle-open', ctrl.toggleShopOpen);

router.post('/product', upload.single('image'), ctrl.addProduct);
router.get('/products', ctrl.getMyProducts);
router.put('/product/:id', upload.single('image'), ctrl.updateProduct);
router.delete('/product/:id', ctrl.deleteProduct);
router.patch('/product/:id/toggle-stock', ctrl.toggleProductStock);

router.get('/orders', ctrl.getShopOrders);
router.patch('/order/:id/status', ctrl.updateOrderStatus);

router.get('/profile',           ctrl.getProfile);
router.put('/profile',           upload.single('avatar'), ctrl.updateProfile);
router.put('/profile/password',  ctrl.changePassword);

module.exports = router;
