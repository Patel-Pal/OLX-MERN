const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getProfile, updateBuyerProfile } = require('../controllers/authController');
const { authenticate, verifyToken } = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', authenticate, updateProfile);
router.get('/profile', authenticate, getProfile);

// Update buyer profile at billing 
router.put('/profile', verifyToken,updateBuyerProfile);


module.exports = router;
