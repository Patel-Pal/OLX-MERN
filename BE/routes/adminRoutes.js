const express = require('express');
const router = express.Router();
const {
  getStats,
  getBuyers,
  getSellers,
  getUsersByRole,
  getAllProducts,
  getRevenue,
  toggleUserStatus,
  deleteProduct,
  toggleProductStatus
} = require('../controllers/adminController');
const { authenticate, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/stats', authenticate, verifyAdmin, getStats);
router.get('/buyers', authenticate, verifyAdmin, getBuyers);
router.get('/sellers', authenticate, verifyAdmin, getSellers);
router.get('/users/:role', authenticate, verifyAdmin, getUsersByRole);
router.get('/products', authenticate, verifyAdmin, getAllProducts);
router.get('/revenue', authenticate, verifyAdmin, getRevenue);
router.put('/user/:id/toggle', authenticate, verifyAdmin, toggleUserStatus);
router.delete('/product/:id', authenticate, verifyAdmin, deleteProduct);
router.put('/product/:id/toggle', authenticate, verifyAdmin, toggleProductStatus);

module.exports = router;
