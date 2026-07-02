const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/superAdminController');

router.use(protect, authorize('superadmin'));

router.get('/dashboard', ctrl.getDashboard);

router.post('/admin', ctrl.createAdmin);
router.get('/admins', ctrl.getAllAdmins);
router.get('/admin/:id', ctrl.getAdminById);
router.patch('/admin/:id/toggle', ctrl.toggleAdminStatus);

router.get('/users', ctrl.getAllUsers);

router.get('/shops', ctrl.getAllShops);
router.get('/shop/:id/details', ctrl.getShopDetails);
router.patch('/shop/:id/toggle', ctrl.toggleShopStatus);
router.patch('/shop/:id/name', ctrl.updateShopName);
router.delete('/shop/:id', ctrl.deleteShop);

router.get('/orders', ctrl.getAllOrders);

// Categories
router.get('/categories',         ctrl.getCategories);
router.post('/categories',        ctrl.createCategory);
router.delete('/category/:id',    ctrl.deleteCategory);

module.exports = router;
